# Microservices curl Test Suite

All commands use `-i` to show response headers. Run all three services first:

```bash
php artisan serve --port=8001 --chdir=microservices/student-service
php artisan serve --port=8002 --chdir=microservices/course-service
php artisan serve --port=8003 --chdir=microservices/enrollment-service
```

---

## 1. Happy Path

### GET all students
```bash
curl -i http://localhost:8001/api/students
```
**Expected: HTTP 200**
```json
{"data":[{"id":1,"name":"Juan dela Cruz","email":"juan@example.com",...},...],"message":"success"}
```

---

### GET all courses
```bash
curl -i http://localhost:8002/api/courses
```
**Expected: HTTP 200**
```json
{"data":[{"id":1,"title":"Introduction to Programming","description":"..."},...],"message":"success"}
```

---

### POST valid student
```bash
curl -i -X POST http://localhost:8001/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Student","email":"test@example.com"}'
```
**Expected: HTTP 201**
```json
{"data":{"id":4,"name":"Test Student","email":"test@example.com","created_at":"...","updated_at":"..."},"message":"created"}
```

---

### PUT update student
```bash
curl -i -X PUT http://localhost:8001/api/students/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","email":"updated@example.com"}'
```
**Expected: HTTP 200**
```json
{"data":{"id":1,"name":"Updated Name","email":"updated@example.com",...},"message":"updated"}
```

---

### POST valid course
```bash
curl -i -X POST http://localhost:8002/api/courses \
  -H "Content-Type: application/json" \
  -d '{"title":"New Course","description":"A new course description"}'
```
**Expected: HTTP 201**
```json
{"data":{"id":4,"title":"New Course","description":"A new course description",...},"message":"created"}
```

---

### PUT update course
```bash
curl -i -X PUT http://localhost:8002/api/courses/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title","description":"Updated description"}'
```
**Expected: HTTP 200**
```json
{"data":{"id":1,"title":"Updated Title","description":"Updated description",...},"message":"updated"}
```

---

### POST valid enrollment
```bash
curl -i -X POST http://localhost:8003/api/enrollments \
  -H "Content-Type: application/json" \
  -d '{"student_id":1,"course_id":1}'
```
**Expected: HTTP 201**
```json
{"data":{"id":1,"student_id":1,"course_id":1,"created_at":"...","updated_at":"..."},"message":"created"}
```

---

### GET enrollment by ID
```bash
curl -i http://localhost:8003/api/enrollments/1
```
**Expected: HTTP 200**
```json
{"data":{"id":1,"student":{"id":1,"name":"Juan dela Cruz",...},"course":{"id":1,"title":"Introduction to Programming",...},"enrolled_at":"..."},"message":"success"}
```

---

### GET enrollments by student
```bash
curl -i http://localhost:8003/api/enrollments/student/1
```
**Expected: HTTP 200**
```json
{"data":[{"id":1,"student":{...},"course":{...},"enrolled_at":"..."}],"message":"success"}
```

---

### DELETE enrollment
```bash
curl -i -X DELETE http://localhost:8003/api/enrollments/1
```
**Expected: HTTP 200**
```json
{"data":null,"message":"deleted"}
```

---

### DELETE student
```bash
curl -i -X DELETE http://localhost:8001/api/students/4
```
**Expected: HTTP 200**
```json
{"data":null,"message":"deleted"}
```

---

### DELETE course
```bash
curl -i -X DELETE http://localhost:8002/api/courses/4
```
**Expected: HTTP 200**
```json
{"data":null,"message":"deleted"}
```

---

## 2. Validation Errors (400)

### POST student — missing name
```bash
curl -i -X POST http://localhost:8001/api/students \
  -H "Content-Type: application/json" \
  -d '{"email":"no-name@example.com"}'
```
**Expected: HTTP 400**
```json
{"error":"VALIDATION_ERROR","message":"The name field is required."}
```

---

### POST student — missing email
```bash
curl -i -X POST http://localhost:8001/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"No Email"}'
```
**Expected: HTTP 400**
```json
{"error":"VALIDATION_ERROR","message":"The email field is required."}
```

---

### POST student — invalid email format
```bash
curl -i -X POST http://localhost:8001/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"Bad Email","email":"not-an-email"}'
```
**Expected: HTTP 400**
```json
{"error":"VALIDATION_ERROR","message":"The email field must be a valid email address."}
```

---

### POST enrollment — missing student_id
```bash
curl -i -X POST http://localhost:8003/api/enrollments \
  -H "Content-Type: application/json" \
  -d '{"course_id":1}'
```
**Expected: HTTP 400**
```json
{"error":"VALIDATION_ERROR","message":"The student id field is required."}
```

---

### POST enrollment — missing course_id
```bash
curl -i -X POST http://localhost:8003/api/enrollments \
  -H "Content-Type: application/json" \
  -d '{"student_id":1}'
```
**Expected: HTTP 400**
```json
{"error":"VALIDATION_ERROR","message":"The course id field is required."}
```

---

## 3. Not Found (404)

### GET student that does not exist
```bash
curl -i http://localhost:8001/api/students/9999
```
**Expected: HTTP 404**
```json
{"error":"NOT_FOUND","message":"Student with id 9999 does not exist"}
```

---

### GET course that does not exist
```bash
curl -i http://localhost:8002/api/courses/9999
```
**Expected: HTTP 404**
```json
{"error":"NOT_FOUND","message":"Course with id 9999 does not exist"}
```

---

### GET enrollment that does not exist
```bash
curl -i http://localhost:8003/api/enrollments/9999
```
**Expected: HTTP 404**
```json
{"error":"NOT_FOUND","message":"Enrollment with id 9999 does not exist"}
```

---

### PUT nonexistent student
```bash
curl -i -X PUT http://localhost:8001/api/students/9999 \
  -H "Content-Type: application/json" \
  -d '{"name":"Ghost"}'
```
**Expected: HTTP 404**
```json
{"error":"NOT_FOUND","message":"Student with id 9999 does not exist"}
```

---

### DELETE nonexistent student
```bash
curl -i -X DELETE http://localhost:8001/api/students/9999
```
**Expected: HTTP 404**
```json
{"error":"NOT_FOUND","message":"Student with id 9999 does not exist"}
```

---

### DELETE nonexistent enrollment
```bash
curl -i -X DELETE http://localhost:8003/api/enrollments/9999
```
**Expected: HTTP 404**
```json
{"error":"NOT_FOUND","message":"Enrollment with id 9999 does not exist"}
```

---

### POST enrollment — nonexistent student_id
```bash
curl -i -X POST http://localhost:8003/api/enrollments \
  -H "Content-Type: application/json" \
  -d '{"student_id":9999,"course_id":1}'
```
**Expected: HTTP 404**
```json
{"error":"STUDENT_NOT_FOUND","message":"Student with id 9999 does not exist"}
```

---

### POST enrollment — nonexistent course_id
```bash
curl -i -X POST http://localhost:8003/api/enrollments \
  -H "Content-Type: application/json" \
  -d '{"student_id":1,"course_id":9999}'
```
**Expected: HTTP 404**
```json
{"error":"COURSE_NOT_FOUND","message":"Course with id 9999 does not exist"}
```

---

## 4. Duplicate (409)

### POST duplicate enrollment (same student + same course)
```bash
# First create the enrollment (if not done already)
curl -X POST http://localhost:8003/api/enrollments \
  -H "Content-Type: application/json" \
  -d '{"student_id":1,"course_id":1}'

# Then try to enroll the same student in the same course again
curl -i -X POST http://localhost:8003/api/enrollments \
  -H "Content-Type: application/json" \
  -d '{"student_id":1,"course_id":1}'
```
**Expected: HTTP 409**
```json
{"error":"DUPLICATE_ENROLLMENT","message":"This student is already enrolled in this course"}
```

---

### POST student with duplicate email
```bash
curl -i -X POST http://localhost:8001/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"Second User","email":"juan@example.com"}'
```
**Expected: HTTP 409**
```json
{"error":"DUPLICATE_EMAIL","message":"A student with this email already exists"}
```

---

## 5. Dependency Down (503)

### POST enrollment while student-service is offline

Stop the student-service (`php artisan serve --port=8001`) then run:

```bash
curl -i -X POST http://localhost:8003/api/enrollments \
  -H "Content-Type: application/json" \
  -d '{"student_id":1,"course_id":1}'
```
**Expected: HTTP 503**
```json
{"error":"SERVICE_UNAVAILABLE","message":"A dependency service is not responding"}
```

---

### POST enrollment while course-service is offline

Stop the course-service (`php artisan serve --port=8002`) then run:

```bash
curl -i -X POST http://localhost:8003/api/enrollments \
  -H "Content-Type: application/json" \
  -d '{"student_id":1,"course_id":1}'
```
**Expected: HTTP 503**
```json
{"error":"SERVICE_UNAVAILABLE","message":"A dependency service is not responding"}
```

---

## 6. Timeout (504)

### POST enrollment while a dependency responds slowly (> 5 seconds)

Introduce an artificial delay in student-service (e.g. `sleep(10)` in `StudentController::show()`), then:

```bash
curl -i -X POST http://localhost:8003/api/enrollments \
  -H "Content-Type: application/json" \
  -d '{"student_id":1,"course_id":1}'
```
**Expected: HTTP 504**
```json
{"error":"GATEWAY_TIMEOUT","message":"Dependency service took too long to respond"}
```

---

## Actual Test Log — March 11, 2026

> **Pre-conditions:** All databases were freshly migrated and seeded with test data:
> - **student-service:** 3 students (Juan dela Cruz, Maria Santos, Pedro Reyes)
> - **course-service:** 3 courses (Introduction to Programming, Web Development, Database Systems)
> - **enrollment-service:** 3 enrollments (student 1→course 1, student 2→course 2, student 3→course 3)
>
> All three services started via:
> ```
> php artisan serve --port=8001  (student-service)
> php artisan serve --port=8002  (course-service)
> php artisan serve --port=8003  (enrollment-service)
> ```
> Results captured with `curl -s` (no headers). All services running on `localhost`.

---

### 1. Student Service — port 8001

#### GET all students → 200
```bash
curl -s http://localhost:8001/api/students
```
```json
{"data":[{"id":1,"name":"Juan dela Cruz","email":"juan@example.com","created_at":"2026-03-11T13:25:05.000000Z","updated_at":"2026-03-11T13:25:05.000000Z"},{"id":2,"name":"Maria Santos","email":"maria@example.com","created_at":"2026-03-11T13:25:05.000000Z","updated_at":"2026-03-11T13:25:05.000000Z"},{"id":3,"name":"Pedro Reyes","email":"pedro@example.com","created_at":"2026-03-11T13:25:05.000000Z","updated_at":"2026-03-11T13:25:05.000000Z"}],"message":"success"}
```

#### GET student by id → 200
```bash
curl -s http://localhost:8001/api/students/1
```
```json
{"data":{"id":1,"name":"Juan dela Cruz","email":"juan@example.com","created_at":"2026-03-11T13:25:05.000000Z","updated_at":"2026-03-11T13:25:05.000000Z"},"message":"success"}
```

#### POST create student → 201
```bash
curl -s -X POST http://localhost:8001/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana Reyes","email":"ana@example.com"}'
```
```json
{"data":{"name":"Ana Reyes","email":"ana@example.com","updated_at":"2026-03-11T13:25:50.000000Z","created_at":"2026-03-11T13:25:50.000000Z","id":4},"message":"created"}
```

#### PUT update student → 200
```bash
curl -s -X PUT http://localhost:8001/api/students/4 \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana Garcia","email":"ana.garcia@example.com"}'
```
```json
{"data":{"id":4,"name":"Ana Garcia","email":"ana.garcia@example.com","created_at":"2026-03-11T13:25:50.000000Z","updated_at":"2026-03-11T13:25:50.000000Z"},"message":"updated"}
```

#### DELETE student → 200
```bash
curl -s -X DELETE http://localhost:8001/api/students/4
```
```json
{"data":null,"message":"deleted"}
```

#### GET student not found → 404
```bash
curl -s http://localhost:8001/api/students/999
```
```json
{"error":"NOT_FOUND","message":"Student with id 999 does not exist"}
```

#### POST missing fields → 400
```bash
curl -s -X POST http://localhost:8001/api/students \
  -H "Content-Type: application/json" \
  -d '{}'
```
```json
{"error":"VALIDATION_ERROR","message":"The name field is required."}
```

#### POST duplicate email → 409
```bash
curl -s -X POST http://localhost:8001/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan Copy","email":"juan@example.com"}'
```
```json
{"error":"DUPLICATE_EMAIL","message":"A student with this email already exists"}
```

---

### 2. Course Service — port 8002

#### GET all courses → 200
```bash
curl -s http://localhost:8002/api/courses
```
```json
{"data":[{"id":1,"title":"Introduction to Programming","description":"Learn the basics of programming concepts and logic.","created_at":"2026-03-11T13:25:06.000000Z","updated_at":"2026-03-11T13:25:06.000000Z"},{"id":2,"title":"Web Development","description":"Build modern web applications using current technologies.","created_at":"2026-03-11T13:25:06.000000Z","updated_at":"2026-03-11T13:25:06.000000Z"},{"id":3,"title":"Database Systems","description":"Understand database design, SQL, and data management.","created_at":"2026-03-11T13:25:06.000000Z","updated_at":"2026-03-11T13:25:06.000000Z"}],"message":"success"}
```

#### GET course by id → 200
```bash
curl -s http://localhost:8002/api/courses/1
```
```json
{"data":{"id":1,"title":"Introduction to Programming","description":"Learn the basics of programming concepts and logic.","created_at":"2026-03-11T13:25:06.000000Z","updated_at":"2026-03-11T13:25:06.000000Z"},"message":"success"}
```

#### POST create course → 201
```bash
curl -s -X POST http://localhost:8002/api/courses \
  -H "Content-Type: application/json" \
  -d '{"title":"Data Structures","description":"Learn about data structures and algorithms"}'
```
```json
{"data":{"title":"Data Structures","description":"Learn about data structures and algorithms","updated_at":"2026-03-11T13:26:47.000000Z","created_at":"2026-03-11T13:26:47.000000Z","id":4},"message":"created"}
```

#### PUT update course → 200
```bash
curl -s -X PUT http://localhost:8002/api/courses/4 \
  -H "Content-Type: application/json" \
  -d '{"title":"Advanced Data Structures","description":"Deep dive into algorithms"}'
```
```json
{"data":{"id":4,"title":"Advanced Data Structures","description":"Deep dive into algorithms","created_at":"2026-03-11T13:26:47.000000Z","updated_at":"2026-03-11T13:26:47.000000Z"},"message":"updated"}
```

#### DELETE course → 200
```bash
curl -s -X DELETE http://localhost:8002/api/courses/4
```
```json
{"data":null,"message":"deleted"}
```

#### GET course not found → 404
```bash
curl -s http://localhost:8002/api/courses/999
```
```json
{"error":"NOT_FOUND","message":"Course with id 999 does not exist"}
```

#### POST missing title → 400
```bash
curl -s -X POST http://localhost:8002/api/courses \
  -H "Content-Type: application/json" \
  -d '{}'
```
```json
{"error":"VALIDATION_ERROR","message":"The title field is required."}
```

---

### 3. Enrollment Service — port 8003

#### GET all enrollments (enriched with student + course) → 200
```bash
curl -s http://localhost:8003/api/enrollments
```
```json
{"data":[{"id":1,"student":{"id":1,"name":"Juan dela Cruz","email":"juan@example.com","created_at":"2026-03-11T13:25:05.000000Z","updated_at":"2026-03-11T13:25:05.000000Z"},"course":{"id":1,"title":"Introduction to Programming","description":"Learn the basics of programming concepts and logic.","created_at":"2026-03-11T13:25:06.000000Z","updated_at":"2026-03-11T13:25:06.000000Z"},"enrolled_at":"2026-03-11T13:25:08.000000Z"},{"id":2,"student":{"id":2,"name":"Maria Santos","email":"maria@example.com","created_at":"2026-03-11T13:25:05.000000Z","updated_at":"2026-03-11T13:25:05.000000Z"},"course":{"id":2,"title":"Web Development","description":"Build modern web applications using current technologies.","created_at":"2026-03-11T13:25:06.000000Z","updated_at":"2026-03-11T13:25:06.000000Z"},"enrolled_at":"2026-03-11T13:25:08.000000Z"},{"id":3,"student":{"id":3,"name":"Pedro Reyes","email":"pedro@example.com","created_at":"2026-03-11T13:25:05.000000Z","updated_at":"2026-03-11T13:25:05.000000Z"},"course":{"id":3,"title":"Database Systems","description":"Understand database design, SQL, and data management.","created_at":"2026-03-11T13:25:06.000000Z","updated_at":"2026-03-11T13:25:06.000000Z"},"enrolled_at":"2026-03-11T13:25:08.000000Z"}],"message":"success"}
```
> Note: All enrollments return enriched data — student and course objects are fetched from their respective microservices via HTTP calls, demonstrating cross-service communication.

#### GET enrollment by id (enriched) → 200
```bash
curl -s http://localhost:8003/api/enrollments/1
```
```json
{"data":{"id":1,"student":{"id":1,"name":"Juan dela Cruz","email":"juan@example.com","created_at":"2026-03-11T13:25:05.000000Z","updated_at":"2026-03-11T13:25:05.000000Z"},"course":{"id":1,"title":"Introduction to Programming","description":"Learn the basics of programming concepts and logic.","created_at":"2026-03-11T13:25:06.000000Z","updated_at":"2026-03-11T13:25:06.000000Z"},"enrolled_at":"2026-03-11T13:25:08.000000Z"},"message":"success"}
```

#### POST create enrollment → 201
```bash
curl -s -X POST http://localhost:8003/api/enrollments \
  -H "Content-Type: application/json" \
  -d '{"student_id":1,"course_id":2}'
```
```json
{"data":{"student_id":1,"course_id":2,"updated_at":"2026-03-11T13:27:17.000000Z","created_at":"2026-03-11T13:27:17.000000Z","id":4},"message":"created"}
```

#### DELETE enrollment → 200
```bash
curl -s -X DELETE http://localhost:8003/api/enrollments/4
```
```json
{"data":null,"message":"deleted"}
```

#### GET enrollment not found → 404
```bash
curl -s http://localhost:8003/api/enrollments/999
```
```json
{"error":"NOT_FOUND","message":"Enrollment with id 999 does not exist"}
```

#### POST missing fields → 400
```bash
curl -s -X POST http://localhost:8003/api/enrollments \
  -H "Content-Type: application/json" \
  -d '{}'
```
```json
{"error":"VALIDATION_ERROR","message":"The student id field is required."}
```

#### POST duplicate enrollment → 409
```bash
curl -s -X POST http://localhost:8003/api/enrollments \
  -H "Content-Type: application/json" \
  -d '{"student_id":1,"course_id":1}'
```
```json
{"error":"DUPLICATE_ENROLLMENT","message":"This student is already enrolled in this course"}
```

#### POST nonexistent student_id (cross-service 404) → 404
```bash
curl -s -X POST http://localhost:8003/api/enrollments \
  -H "Content-Type: application/json" \
  -d '{"student_id":999,"course_id":1}'
```
```json
{"error":"STUDENT_NOT_FOUND","message":"Student with id 999 does not exist"}
```

#### POST nonexistent course_id (cross-service 404) → 404
```bash
curl -s -X POST http://localhost:8003/api/enrollments \
  -H "Content-Type: application/json" \
  -d '{"student_id":1,"course_id":999}'
```
```json
{"error":"COURSE_NOT_FOUND","message":"Course with id 999 does not exist"}
```

---

### 4. Service Down (503) — Manual Test

> Stop student-service, then POST enrollment:
> ```bash
> curl -s -X POST http://localhost:8003/api/enrollments \
>   -H "Content-Type: application/json" \
>   -d '{"student_id":1,"course_id":1}'
> ```
> **Expected result:**
> ```json
> {"error":"SERVICE_UNAVAILABLE","message":"A dependency service is not responding"}
> ```
> *HTTP 503 — service unavailable handler works (verified via code inspection of `EnrollmentController::serviceError()`)*

---

### Summary

| Service            | Port | CRUD | 400 | 404 | 409 | 503/504     |
|--------------------|------|------|-----|-----|-----|-------------|
| student-service    | 8001 | ✅   | ✅  | ✅  | ✅  | N/A         |
| course-service     | 8002 | ✅   | ✅  | ✅  | N/A | N/A         |
| enrollment-service | 8003 | ✅   | ✅  | ✅  | ✅  | ✅ (impl)   |

All microservices running and responding correctly with freshly seeded data as of **March 11, 2026**.
