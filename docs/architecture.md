# Architecture

> **Subject:** System Architecture and Integration 2
> **Section:** BIST 3B
> **Members:** Sagum, Patrick Ruiz · Henson, Princess Terana Caram Rasonable · Gargarita, Trisha Faith Casiano · Mogat, Ela Mae Trojillo · Tibo-oc, Paul Felippe Gelle

---

## Architecture Comparison

Academe is a student course management system built with **Laravel 10** and **PHP 8.4**. It demonstrates two architectural approaches — a monolithic application using the **Model–View–Controller–Repository (MVCR)** pattern and a microservices decomposition into three independent services — with a runtime toggle that lets the frontend switch between them.

---

## 1. Monolithic Architecture (MVCR)

The monolithic application (`academe/`) follows the **Model–View–Controller–Repository** pattern inside a single Laravel project. Every request flows through seven layers:

```
┌────────────────────────────────────────────────────────┐
│              REQUEST — Browser (port 8000)              │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│               ROUTE — routes/api.php · web.php          │
│               Route → Controller mapping                │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│           VALIDATE — app/Http/Requests/                 │
│    StoreStudentRequest · StoreEnrollmentRequest         │
│   authorize() + rules() — validated before controller   │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│            CONTROL — app/Http/Controllers/              │
│  StudentController · CourseController · EnrollmentCtrl  │
│  Injects RepositoryInterface — no direct DB calls       │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│   REPO — Repositories/Interfaces/ → Repositories/       │
│  StudentRepositoryInterface → StudentRepository         │
│  CourseRepositoryInterface  → CourseRepository           │
│  EnrollmentRepoInterface   → EnrollmentRepository       │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│            MODEL — app/Models/                          │
│    Student · Course · Enrollment (Eloquent ORM)         │
│    fillable, relationships, casts                       │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│          DATABASE — SQLite (database.sqlite)            │
└────────────────────────────────────────────────────────┘

RESPONSE path (right side):
Controller → View (Blade) → HTTP Response back to browser
```

**Key points:**
- All three domain objects (Student, Course, Enrollment) share a **single SQLite database**.
- Repository interfaces are bound to Eloquent implementations in `AppServiceProvider`.
- Controllers receive repository implementations via **constructor injection** — they never call Eloquent directly.
- Form validation is handled **before** the controller executes via `FormRequest` classes (`StoreStudentRequest`, `StoreEnrollmentRequest`), keeping controller methods focused on orchestration.
- Cascade deletes (e.g., deleting a student removes their enrollments) are handled in the repository layer using Eloquent relationships.

---

## 2. Microservices Architecture

The system is split into three independent Laravel services, each owning its own database.

```
┌──────────────────────────────────────────────────────────┐
│         Academe Laravel App  :8000                        │
│         APP_BACKEND=microservices in .env                  │
└───────┬────────────────────┬────────────────┬────────────┘
        │                    │                │
        ▼                    ▼                ▼
┌───────────────┐   ┌───────────────┐   ┌────────────────┐
│ STUDENT SVC   │   │ COURSE SVC    │   │ ENROLLMENT SVC │
│ :8001         │   │ :8002         │   │ :8003          │
│               │   │               │   │                │
│ REST API      │   │ REST API      │   │ REST API       │
│ GET  /students│   │ GET  /courses │   │ GET  /enroll.  │
│ POST /students│   │ POST /courses │   │ POST /enroll.  │
│ GET  /{id}    │   │ GET  /{id}    │   │ GET  /{id}     │
│ PUT  /{id}    │   │ PUT  /{id}    │   │ DELETE /{id}   │
│ DELETE /{id}  │   │ DELETE /{id}  │   │ GET /student/  │
│               │   │               │   │   {id}         │
│ [students.    │   │ [courses.     │   │ [enrollments.  │
│  sqlite]      │   │  sqlite]      │   │  sqlite]       │
└───────────────┘   └───────────────┘   └───────┬────────┘
                                                │
                       Inter-service HTTP ───────┘
                        ┌───────────┐   ┌───────────┐
                        │ :8001     │   │ :8002     │
                        │ student?  │   │ course?   │
                        └───────────┘   └───────────┘

Legend:
─────  Service call (from Academe frontend)
- - -  Inter-service HTTP call (Enrollment → Student/Course)
```

**Key points:**
- Each service owns its own SQLite database and **only** its domain data.
- The enrollment service validates foreign keys by making synchronous `HTTP GET` calls to the student and course services before writing.
- No shared database, no message queue, no API gateway.
- `Http::timeout(5)` is used for all cross-service calls. Failures produce **503** (connection refused) or **504** (timeout).
- JSON API format: `{"data": {...}, "message": "..."}` — consistent across all services.

---

## 3. Backend Switch Mechanism

The monolithic app (`academe/`) can operate in two modes controlled by `APP_BACKEND` in `.env`:

```
┌───────────────────────────────────────────────────────────┐
│                    Controllers                             │
│                                                           │
│  if (config('backend.mode') === 'microservices')          │
│      → use ServiceClient (HTTP calls to :8001/8002/8003)  │
│  else                                                     │
│      → use Repository (direct Eloquent/SQLite)            │
└───────────────────────────────────────────────────────────┘
```

**Service Clients** (`app/Services/`):
- `StudentServiceClient` — full CRUD via HTTP to `:8001`
- `CourseServiceClient` — full CRUD via HTTP to `:8002`
- `EnrollmentServiceClient` — CRUD + `byStudent()` via HTTP to `:8003`

Each controller method checks `config('backend.mode')` and branches at the top. The views receive the same data shape (cast to `(object)` in service clients) regardless of backend mode.

To switch modes:
1. Set `APP_BACKEND=monolithic` or `APP_BACKEND=microservices` in `academe/.env`
2. Run `php artisan config:clear`
3. Refresh the browser — the topbar badge confirms the active mode

---

## 4. Data Flow: Create Enrollment

### Monolithic mode

```
Browser POST /enrollments {student_id, course_id}
  → EnrollmentController::store()
    → StoreEnrollmentRequest validates (exists:students, exists:courses)
    → EnrollmentRepository::create()
      → Enrollment::create() [single SQLite DB]
    → redirect with success
```

### Microservices mode

```
Browser POST /enrollments {student_id, course_id}
  → EnrollmentController::store()
    → EnrollmentServiceClient::create()
      → POST http://localhost:8003/api/enrollments
        → EnrollmentController (enrollment-service)
          → Validator::make (400 if invalid)
          → GET http://localhost:8001/api/students/{id} (404 if missing, 503/504 if down)
          → GET http://localhost:8002/api/courses/{id} (404 if missing, 503/504 if down)
          → Check duplicate (409 if exists)
          → Enrollment::create() [enrollment-service SQLite]
          → 201 Created
    → redirect with success
```

The two flows produce identical outcomes from the user's perspective — the differences are entirely in the infrastructure layer.
