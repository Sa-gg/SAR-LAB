# Lab 1 — Monolith vs Microservices
### ITSAR2 313 – System Architecture and Integration 2
### BIST 3B

> This lab implements a Student Course System in two architectures:
> a **monolithic** app (Academe) and a **microservices** decomposition,
> both accessible through the same Laravel frontend via a config switch.

## Members

| # | Name |
|---|------|
| 1 | Sagum, Patrick Ruiz |
| 2 | Henson, Princess Terana Caram Rasonable |
| 3 | Gargarita, Trisha Faith Casiano |
| 4 | Mogat, Ela Mae Trojillo |
| 5 | Tibo-oc, Paul Felippe Gelle |

## GitHub

> **Repository (Lab 1 Branch):** [./](./)

---

## Applications

| App | Description | Port |
|-----|-------------|------|
| `academe/` | Laravel frontend + monolithic backend | 8000 |
| `microservices/student-service/` | Student REST API | 8001 |
| `microservices/course-service/` | Course REST API | 8002 |
| `microservices/enrollment-service/` | Enrollment REST API | 8003 |

---

## Stack

| Layer | Technology |
|------|------------|
| Frontend | Laravel Blade + Vite |
| Backend | Laravel / PHP |
| Database | SQLite |
| API mode | Monolith + Microservices |

## Seeded Data

- Students: 3 seeded records
- Courses: 3 seeded records
- Enrollments: seeded in Academe, empty/fresh in standalone enrollment service unless created by tests

## Prerequisites

- Node.js 18+
- npm
- PHP 8.2+
- Composer
- curl
- Git Bash (only if using the bash script alternative below)

## Quick Start (Branch: `lab1`)

From repository root, run:

```bash
bash scripts/setup.sh
```

`scripts/setup.sh` does a **fresh setup**:
- installs PHP dependencies for all services and `academe/`
- installs Node dependencies for `academe/` if needed
- builds frontend assets if needed
- copies `.env` files if missing
- regenerates app keys
- recreates all SQLite databases from scratch with seed data

Then open 4 terminals and run:

```bash
bash scripts/serve-microservice.sh student
bash scripts/serve-microservice.sh course
bash scripts/serve-microservice.sh enrollment
bash scripts/serve-academe.sh
```

Open: http://localhost:8000

Why first run can take time:
- Composer downloads Laravel dependencies
- npm downloads frontend packages
- Vite builds frontend assets
- each database is recreated from scratch

Reruns are faster because existing `vendor/`, `node_modules/`, and built assets are reused.

## Terminal Note (Windows)

For scripted setup/start, use Git Bash (or WSL). If using Command Prompt/PowerShell only, use the manual commands in Option A/Option B below.

---

## Option A — Run with Microservices (Primary)

> For quick professor testing, use **Quick Start** above.

> **This is the primary architecture required by the lab.**

**Terminal 1 — Student Service:**
```bash
cd microservices/student-service
composer install
cp .env.example .env
php artisan key:generate
touch database/students.sqlite
php artisan migrate --seed
php artisan serve --port=8001
```

**Terminal 2 — Course Service:**
```bash
cd microservices/course-service
composer install
cp .env.example .env
php artisan key:generate
touch database/courses.sqlite
php artisan migrate --seed
php artisan serve --port=8002
```

**Terminal 3 — Enrollment Service:**
```bash
cd microservices/enrollment-service
composer install
cp .env.example .env
php artisan key:generate
touch database/enrollments.sqlite
php artisan migrate
php artisan serve --port=8003
```

**Terminal 4 — Frontend (Academe):**
```bash
cd academe
composer install
npm install && npm run build
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
# APP_BACKEND=microservices is already the default in .env.example
php artisan config:clear
php artisan serve
# Visit http://localhost:8000
# Topbar badge shows "⬡ Microservices"
```

---

## Option B — Run Monolithic Only (Optional)

> Provided for architectural comparison only.

```bash
cd academe
composer install
npm install && npm run build
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
# In .env: set APP_BACKEND=monolithic
php artisan config:clear
php artisan serve
# Visit http://localhost:8000
# Topbar badge shows "⬡ Monolithic"
```

### Switching Between Backends

```bash
# Edit academe/.env
# Change APP_BACKEND=monolithic  OR  APP_BACKEND=microservices
php artisan config:clear
# Refresh browser — topbar badge confirms active backend
```

---

## Microservices API Endpoints

### Student Service (port 8001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | List all students |
| POST | `/api/students` | Create student |
| GET | `/api/students/{id}` | Get student by ID |
| PUT | `/api/students/{id}` | Update student |
| DELETE | `/api/students/{id}` | Delete student |

### Course Service (port 8002)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | List all courses |
| POST | `/api/courses` | Create course |
| GET | `/api/courses/{id}` | Get course by ID |
| PUT | `/api/courses/{id}` | Update course |
| DELETE | `/api/courses/{id}` | Delete course |

### Enrollment Service (port 8003)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/enrollments` | List all enrollments |
| POST | `/api/enrollments` | Create enrollment |
| GET | `/api/enrollments/{id}` | Get enrollment by ID (enriched) |
| GET | `/api/enrollments/student/{id}` | Get enrollments by student |
| DELETE | `/api/enrollments/{id}` | Delete enrollment |

---

## Architecture Pattern

The monolithic backend and the Academe frontend both implement the
**Model-View-Controller-Repository (MVCR)** pattern. Controllers delegate
all data access to repository interfaces resolved by Laravel's service
container — swapping backends requires only a config change.

```
APP_BACKEND=microservices  →  repositories call HTTP APIs on ports 8001–8003
APP_BACKEND=monolithic     →  repositories call Eloquent models directly
```

---

## Deliverables

| Item | Location |
|------|----------|
| Monolithic source code | `academe/` |
| Microservices source code | `microservices/` |
| Architecture documentation | `docs/architecture.md` |
| Architecture report (DOCX) | `docs/architecture.docx` |
| Comparison table | `docs/comparison-table.md` |
| Reflection | `docs/reflection.md` |
| Lab 1 formal report (PDF) | `docs/lab1-report.pdf` |
| Lab 1 source report (DOCX) | `docs/lab1-report.docx` |

---

## Requirements

See **Prerequisites** above.

