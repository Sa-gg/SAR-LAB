# Monolithic vs Microservices Comparison

> **Subject:** System Architecture and Integration 2
> **Section:** BIST 3B
> **Members:** Sagum, Patrick Ruiz · Henson, Princess Terana Caram Rasonable · Gargarita, Trisha Faith Casiano · Mogat, Ela Mae Trojillo · Tibo-oc, Paul Felippe Gelle

---

## Side-by-Side Comparison

| Criteria | Monolithic | Microservices | Winner |
|----------|-----------|---------------|--------|
| **Ease of Development** | Low complexity — single codebase, shared ORM, one database | High complexity — distributed systems, inter-service HTTP, separate codebases | **Mono** |
| **Deployment Difficulty** | Single artifact, one server, one process | Per-service CI/CD pipelines, container orchestration, three servers | **Mono** |
| **Scalability** | Vertical only — scale everything together | Horizontal — scale each service independently based on load | **Micro** |
| **Fault Isolation** | One bug or exception crashes the entire app | Failure stays within one service boundary; other services remain available | **Micro** |
| **Performance** | In-process calls — no network overhead, single SQL query with eager loading | HTTP round-trips between services add latency and failure modes | **Mono** |
| **Team Autonomy** | Shared repo, merge conflicts, coordinated releases | Independent teams, independent deploys, separate codebases | **Micro** |
| **Data Management** | ACID transactions trivial across all models, DB-level foreign keys | Eventual consistency, no cross-service joins, application-level validation | **Mono** |
| **Debugging** | Single stack trace, shared logs, one terminal window | Distributed tracing required (Jaeger, Zipkin), three terminal windows | **Mono** |
| **Best For** | Small teams, MVPs, lab projects | Large orgs, SaaS, independent scaling needs | **Depends** |

---

## Detailed Comparison

| Aspect | Monolithic (`academe/`) | Microservices (`microservices/`) |
|--------|------------------------|----------------------------------|
| **Codebase** | Single Laravel project | Three separate Laravel projects |
| **Database** | One shared SQLite file (`database.sqlite`) | Three independent SQLite files (`students.sqlite`, `courses.sqlite`, `enrollments.sqlite`) |
| **Port** | 8000 | 8001, 8002, 8003 |
| **Inter-service communication** | Direct PHP method calls via Repository Pattern | Synchronous HTTP (Laravel `Http` facade with `timeout(5)`) |
| **Data consistency** | DB-level foreign keys + Eloquent relationships | Application-level validation via HTTP calls before write |
| **Cascade deletes** | Repository calls `$model->enrollments()->delete()` before deleting parent | Each service only deletes its own records; no cross-service cascade |
| **Error handling** | Laravel exception handler → uniform 404 | Each controller catches HTTP response codes + `ConnectionException` → 400/404/409/503/504 |
| **Response format** | Blade views (HTML) for web routes; JSON for API | JSON API (`{"data":...,"message":"..."}`) |
| **Validation** | `FormRequest` classes (`StoreStudentRequest`, `StoreEnrollmentRequest`) | `Validator::make()` in controllers |
| **Duplicate checks** | `unique:students` rule in `StoreStudentRequest` | `Student::where('email', ...)->exists()` in controller |
| **FK checks on enrollment** | `exists:students,id` / `exists:courses,id` rules | HTTP GET to student-service / course-service |
| **Failure modes** | Database errors only | 503 (service down), 504 (timeout), plus database errors |
| **Timeout handling** | N/A (in-process) | `Http::timeout(5)` + `ConnectionException` catch |

---

## Key Architectural Trade-offs

### 1. Data Integrity

The monolith guarantees referential integrity through database foreign keys and Eloquent `exists:` validation rules. If a student is deleted, their enrollments are cascade-deleted in the same database transaction.

In microservices, the enrollment service only stores `student_id` and `course_id` as plain integers — there are no foreign key constraints. Integrity is checked at write time via HTTP calls, but there is no mechanism to automatically remove orphaned enrollments if a student is deleted from the student service.

### 2. Performance

The monolith resolves all data in one process with zero network overhead. A single SQL query with Eloquent eager loading (`with(['student', 'course'])`) fetches an enrollment and its related data.

In microservices, fetching an enrollment requires three steps: (1) read from local DB, (2) HTTP GET to student-service, (3) HTTP GET to course-service. Each network call adds latency and introduces failure modes.

### 3. Fault Isolation

If the monolith's database crashes, everything stops. There is no partial availability.

In microservices, a failure in the student service does not stop the course service. The enrollment service degrades gracefully — reads that require enrichment return 503, but the course listing at `:8002/api/courses` remains unaffected.

### 4. Backend Switch

The `APP_BACKEND` toggle demonstrates that from the controller's perspective, the data source is abstracted. Repository interfaces and service clients share the same conceptual API (`all`, `find`, `create`, `update`, `delete`). The controller branches on `config('backend.mode')` and calls the appropriate implementation.

This pattern shows that the choice between monolith and microservices is an infrastructure decision — the business logic (what data to validate, what to return) stays the same. The Repository Pattern is the bridge that makes this possible.
