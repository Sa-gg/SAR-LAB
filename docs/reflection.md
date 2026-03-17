# Reflection

> **Subject:** System Architecture and Integration 2
> **Section:** BIST 3B
> **Members:** Sagum, Patrick Ruiz · Henson, Princess Terana Caram Rasonable · Gargarita, Trisha Faith Casiano · Mogat, Ela Mae Trojillo · Tibo-oc, Paul Felippe Gelle

---

## Overview

Academe uses a **monolithic architecture with the Repository Pattern (MVCR)** as the preferred design. For a student course management system of this scale, this is the right trade-off — the data model is tightly coupled (students enroll in courses), ACID transactions are critical, and the team size is small. The pattern is embodied in `app/Repositories/` where each domain (Student, Course, Enrollment) has an interface and an Eloquent implementation. Controllers never call Eloquent directly — they type-hint the interface, and Laravel's service container injects the concrete class. Form validation is handled before the controller ever executes via `FormRequest` classes (`StoreStudentRequest`, `StoreEnrollmentRequest`), keeping controller methods focused on orchestration rather than input sanitisation.

The microservices build illustrates where this architecture gains complexity. Every write to `POST /api/enrollments` requires two outbound HTTP calls — `GET http://localhost:8001/api/students/{id}` and `GET http://localhost:8002/api/courses/{id}` — before persisting anything. These calls are wrapped in `try/catch (ConnectionException)` blocks to handle 503/504 scenarios. What was a single in-process Eloquent query in the monolith becomes a distributed transaction with network failure modes, timeout budgets, and partial-failure states that each need explicit handling.

---

## What We Learned

### 1. Monolith-first is easier to reason about

Starting with the monolithic version gave us a solid understanding of the domain model — students, courses, and enrollments with their relationships. The MVCR pattern kept things organized, and having a single database made data integrity straightforward with foreign keys and Eloquent relationships.

### 2. Splitting into microservices exposes hidden assumptions

When we moved to three independent services, we realized how many assumptions the monolith made about data being "just there." The enrollment service could no longer do `exists:students,id` in a validation rule — it had to make an HTTP call to a different server. This forced us to think about what happens when that server is down, slow, or returns unexpected data.

### 3. Error handling in distributed systems is fundamentally different

In the monolith, errors are PHP exceptions that bubble up through a single call stack. In microservices, a "student not found" error starts as a 404 JSON response from the student service, gets interpreted by the enrollment service's HTTP client, and must be translated into a meaningful error for the end user. The cognitive overhead of tracking error origins and propagation paths is significant.

### 4. The 503 vs 504 distinction is subtle but important

Both connection-refused and timeout scenarios throw the same `ConnectionException` in Laravel's HTTP client. We had to inspect the exception message string (`str_contains($e->getMessage(), 'timed out')`) to distinguish them. This feels fragile, and in production we would use proper circuit-breaker libraries and health-check endpoints instead.

### 5. The backend switch was a good exercise in abstraction

Implementing the `APP_BACKEND` toggle showed us that controllers shouldn't care where data comes from. Whether the data is fetched from a local SQLite database or an HTTP API, the controller branches once at the top of each method and the rest of the logic stays the same. This is the Repository Pattern in action — abstracting the data source behind a consistent interface.

---

## Where the Monolith Breaks Down at Scale

As Academe grows to serve thousands of institutions, a single deployment becomes a liability. A spike in enrollment submissions forces scaling the entire application — including the course catalog and student directory — even though only the enrollment path is under load. A bug in one module can bring down the entire system. Teams working on separate domains must coordinate releases, and database schema changes require application-wide migrations that block other work. These are the points at which the clean repository boundaries in `app/Repositories/Interfaces/` would guide a natural decomposition into services.

## Where Microservices Add Unnecessary Complexity

For a lab system with a small team and a single SQLite database, the microservices version requires three separate servers, three separate databases, and inter-service HTTP calls that can fail, time out, or return stale data. The enrollment service must validate student and course existence via the network on every write — something the monolith does with a single Eloquent `exists()` call. Debugging a 503 across three terminal windows is significantly harder than reading a single stack trace. The overhead is real and the benefit — independent scaling — is entirely hypothetical at this scale. Microservices are an organisational solution first; a technical one second.

---

## Challenges We Faced

1. **SQLite path configuration on Windows** — Laravel's SQLite driver requires an absolute path. Relative paths silently create a new empty database in the wrong directory.

2. **Blade views expecting objects** — When data comes from the microservice HTTP client, it arrives as associative arrays. We had to cast everything to `(object)` in the service clients so Blade's `$student->name` syntax works the same as with Eloquent models.

3. **Route ordering for `/enrollments/student/{id}`** — This route had to be registered before the `{id}` wildcard route, otherwise Laravel would try to match "student" as an enrollment ID.

4. **Cascade deletes across service boundaries** — In the monolith, deleting a student also deletes their enrollments in the same transaction. In microservices, deleting a student from the student service leaves orphaned enrollment records in the enrollment service. We documented this as an intentional architectural trade-off.

---

## What We Would Do Differently in Production

1. Use an **event-driven architecture** (message queue) for cross-service data consistency instead of synchronous HTTP.
2. Add **circuit breakers** to prevent cascade failures when a dependency is down.
3. Implement a **`/health` endpoint** on each service for monitoring and load balancer integration.
4. Use **distributed tracing** (OpenTelemetry) to follow a request across all three services.
5. Add **retry logic with exponential backoff** for transient network failures.
6. Use a **proper RDBMS** (PostgreSQL/MySQL) instead of SQLite for production workloads.

---

## Key Takeaways

1. **Monolithic architecture is the correct default** for small teams and MVPs.
2. **Repository Pattern provides clean boundaries** that make future decomposition possible.
3. **Microservices introduce distributed systems complexity** — networking, consistency, observability.
4. **Interface-driven design is the prerequisite** for any architectural evolution.
5. **Choose architecture based on team size, operational maturity, and actual scaling needs** — not trends.
