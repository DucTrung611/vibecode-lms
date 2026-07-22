# API_SPEC.md — Backend (Feature-based, NestJS)

Builds on `DATABASE.md` (entities) and `ARCHITECTURE.md` (controller/service/repository flow). API style: **REST + JSON**.

## 1. Overview

- **Base URL**: `https://api.<domain>/api/v1`
- **Versioning**: URI-based (`/v1`, `/v2`) — a new major version is a new NestJS module set (e.g., `features/*/v2`), old version kept running until clients migrate.
- **Content-Type**: `application/json` for all requests/responses; `multipart/form-data` for file uploads (resources, avatars, assignment submissions).

## 2. Authentication

- **Method**: JWT (access + refresh), backed by the `refresh_tokens` table.
- **Header format**: `Authorization: Bearer <access_token>`
- **Token flow**:
  1. `POST /auth/login` → returns `accessToken` (1 day TTL) + `refreshToken` (7 days TTL, hashed and stored in `refresh_tokens`).
  2. Client sends `accessToken` on every request.
  3. On 401 due to expiry, client calls `POST /auth/refresh` with `refreshToken` → gets a new token pair (rotation: old refresh token is revoked).
  4. `POST /auth/logout` revokes the current refresh token.
- **Auth error handling**: missing/invalid token → `401 AUTH_001`; expired token → `401 AUTH_002`; insufficient role (`RolesGuard`) → `403 AUTH_003`.

## 3. Request Conventions

- **Pagination**: `?page=1&limit=20` (default `page=1`, `limit=20`, max `limit=100`).
- **Sorting**: `?sortBy=createdAt&order=desc` (`order` = `asc` | `desc`).
- **Filtering**: feature-specific query params, e.g. `GET /courses?status=PUBLISHED&categoryId=cat_123&level=BEGINNER&search=algebra` (`search` matches against course `title`/`description`).
- **Request body**: JSON matching the feature's DTO (validated via `class-validator`, see `PROJECT-RULES.md`).
- **File upload**: `multipart/form-data`, field name `file`; response returns the stored `fileUrl`. Max size enforced per feature (e.g., 50MB for videos, 10MB for submissions).

## 4. Response Format

**Success**
```json
{
  "success": true,
  "data": { "id": "clx123", "title": "Intro to Algebra" },
  "meta": { "page": 1, "limit": 20, "total": 42 }
}
```
`meta` is omitted for single-resource responses; present for list endpoints.

**Error**
```json
{
  "success": false,
  "error": {
    "code": "COURSE_004",
    "message": "Course not found",
    "details": null
  }
}
```
Both shapes are produced globally by `ResponseInterceptor` / `HttpExceptionFilter` (see `ARCHITECTURE.md` middleware chain) — controllers never build this envelope manually.

## 5. Error Codes

- **Format**: `[FEATURE]_[NUMBER]`, e.g. `AUTH_001`, `COURSE_004`, `QUIZ_002`.

| Code | HTTP Status | Meaning |
|---|---|---|
| `AUTH_001` | 401 | Missing/invalid access token |
| `AUTH_002` | 401 | Access or refresh token expired |
| `AUTH_003` | 403 | Insufficient role/permission, or resource doesn't belong to the caller |
| `AUTH_004` | 409 | Email already registered |
| `AUTH_005` | 401 | Invalid email or password |
| `AUTH_006` | 401 | Invalid or revoked refresh token |
| `AUTH_007` | 404 | User not found |
| `VALIDATION_001` | 400 | DTO validation failed (`details` lists field errors) |
| `COMMON_404` | 404 | Generic not-found fallback (route threw a plain `NotFoundException`, not a feature-specific `ApiException`) |
| `COMMON_409` | 409 | Generic conflict fallback (route threw a plain `ConflictException`, not a feature-specific `ApiException`) |
| `COMMON_500` | 500 | Unhandled internal error |
| `COURSE_004` | 404 | Course not found |
| `COURSE_005` | 404 | Category not found |
| `COURSE_006` | 404 | Module not found |
| `COURSE_007` | 404 | Lesson not found |
| `ENROLLMENT_001` | 409 | Already enrolled in this course |
| `ENROLLMENT_002` | 404 | Enrollment not found |
| `ENROLLMENT_003` | 404 | Lesson not found in this course |
| `QUIZ_001` | 404 | Quiz not found |
| `QUIZ_002` | 409 | Quiz attempt already submitted |
| `QUIZ_003` | 404 | Attempt not found |
| `QUIZ_004` | 502 | AI provider returned an invalid quiz format when generating a quiz |
| `ASSIGNMENT_001` | 404 | Assignment not found |
| `ASSIGNMENT_002` | 409 | Already submitted this assignment |
| `ASSIGNMENT_003` | 400 | Submission after due date without late-submission policy |
| `ASSIGNMENT_004` | 404 | Submission not found |
| `ASSIGNMENT_005` | 400 | Submission must include a `fileUrl` or `content` |
| `ASSIGNMENT_006` | 400 | Score exceeds the assignment's `maxScore` |
| `CERTIFICATE_001` | 404 | Certificate not found |
| `LEARNING_PATH_001` | 404 | Learning path not found |
| `LEARNING_PATH_002` | 409 | Already enrolled in this learning path |
| `LEARNING_PATH_003` | 502 | AI provider returned an invalid learning path format when generating a path |
| `LEARNING_PATH_004` | 422 | No published courses available to build a learning path from |
| `REVIEW_001` | 409 | Already reviewed this course |
| `NOTIFICATION_001` | 404 | Notification not found |
| `DISCUSSION_001` | 404 | Question not found (answering a missing question id) |
| `CHAT_001` | 404 | Chat session not found |
| `CHAT_002` | 429 | Rate limit on AI calls exceeded — reserved in this table; not yet enforced by `ai-chatbot` (see its `context.md`) |
| `PAYMENT_001` | 402 | Payment required for this course |
| `PAYMENT_002` | 404 | Order not found |
| `PAYMENT_003` | 409 | Order is not payable |
| `UPLOAD_001` | 400 | No file provided to `POST /uploads` |
| `AI_001` | 503 | AI provider is not configured (no API key set) — features with a non-AI fallback (e.g. the chatbot) swallow this instead of surfacing it |
| `AI_002` | 502 | AI provider request failed, returned a non-OK status, or returned an unparseable/empty response |

**HTTP status usage**: `200` read/update OK, `201` created, `204` deleted, `400` validation, `401` auth, `402` payment required, `403` forbidden, `404` not found, `409` conflict, `422` request understood but semantically unprocessable (e.g. nothing to generate from), `429` rate limited, `500` server error, `502`/`503` upstream AI provider failure/unavailable.

## 6. Endpoints by Feature

### Identity / Auth
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Register new student/instructor | Public |
| POST | `/auth/login` | Login, returns token pair | Public |
| POST | `/auth/refresh` | Rotate access token | Public (refresh token) |
| POST | `/auth/logout` | Revoke refresh token | Required |
| GET | `/users/me` | Current user profile | Required |
| PATCH | `/users/me` | Update profile | Required |

### Courses
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/courses` | List/search courses (paginated, filterable) | Public |
| GET | `/courses/:id` | Course detail with modules/lessons | Public |
| POST | `/courses` | Create course | Instructor |
| PATCH | `/courses/:id` | Update course | Instructor (owner) |
| DELETE | `/courses/:id` | Soft-delete course | Instructor (owner) |
| POST | `/courses/:id/modules` | Add module | Instructor (owner) |
| POST | `/modules/:id/lessons` | Add lesson | Instructor (owner) |

### Enrollment
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/courses/:id/enroll` | Enroll in course | Student |
| GET | `/enrollments/me` | My enrollments | Student |
| PATCH | `/enrollments/:id/progress` | Update lesson progress | Student (owner) |

### Quizzes
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/quizzes/:id` | Quiz detail (questions, no answers) | Enrolled student |
| POST | `/quizzes/:id/attempts` | Start attempt | Enrolled student |
| POST | `/attempts/:id/submit` | Submit answers, get score | Attempt owner |
| POST | `/lessons/:id/quizzes/generate` | AI-generate quiz from lesson | Instructor |

### Assignments
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/assignments/:id` | Assignment detail | Enrolled student |
| POST | `/assignments/:id/submissions` | Submit assignment (file/text) | Student |
| PATCH | `/submissions/:id/grade` | Grade submission | Instructor |

### Certificates
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/certificates/me` | My certificates | Student |
| GET | `/certificates/:code/verify` | Public certificate verification | Public |

### Learning Paths
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/learning-paths` | List paths | Public |
| POST | `/learning-paths/generate` | AI-generate personalized path | Student |
| POST | `/learning-paths/:id/enroll` | Enroll in path | Student |

### Reviews
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/courses/:id/reviews` | List reviews for course | Public |
| POST | `/courses/:id/reviews` | Post review | Enrolled student |

### Notifications
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/notifications` | My notifications (paginated) | Required |
| PATCH | `/notifications/:id/read` | Mark as read | Required |

### Discussions (Lesson Q&A)
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/lessons/:id/questions` | List questions for a lesson, with nested answers (paginated) | Enrolled student or owning instructor |
| POST | `/lessons/:id/questions` | Ask a question on a lesson | Enrolled student |
| POST | `/questions/:id/answers` | Answer a question | Enrolled student or owning instructor |

### Instructor Analytics
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/instructor/analytics/overview` | Aggregated totals + per-course summary across all courses the instructor owns | Instructor |
| GET | `/instructor/courses/:id/analytics` | Full analytics detail for one owned course | Instructor (owner) |

### AI Chatbot (RAG)
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/chat/sessions` | Start chat session (optionally scoped to a course) | Student |
| POST | `/chat/sessions/:id/messages` | Send message, get AI reply | Session owner |
| GET | `/chat/sessions/:id` | Get session history | Session owner |

### Payments
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/orders` | Create order for course(s) | Student |
| GET | `/orders/me` | My order history | Student |
| POST | `/orders/:id/pay` | Trigger payment (gateway redirect/intent) | Order owner |

## 7. Endpoint Details (complex endpoints)

### `POST /attempts/:id/submit`
**Request**
```json
{
  "answers": [
    { "questionId": "q_1", "selectedOptionId": "opt_3" },
    { "questionId": "q_2", "answerText": "42" }
  ]
}
```
**Response** `200`
```json
{
  "success": true,
  "data": {
    "attemptId": "att_1",
    "score": 85,
    "passed": true,
    "answers": [
      { "questionId": "q_1", "isCorrect": true },
      { "questionId": "q_2", "isCorrect": false }
    ]
  }
}
```
**Error cases**: `409 QUIZ_002` if already submitted; `404 QUIZ_003` if attempt not found; `403 AUTH_003` if attempt belongs to another student.

### `POST /chat/sessions/:id/messages`
**Request**
```json
{ "content": "Giải thích định lý Pytago giúp em." }
```
**Response** `200`
```json
{
  "success": true,
  "data": {
    "messageId": "msg_9",
    "role": "ASSISTANT",
    "content": "Định lý Pytago phát biểu rằng...",
    "sourcesUsed": ["chunk_12", "chunk_15"]
  }
}
```
Internally: user message persisted → relevant `document_chunks` retrieved (vector similarity, see `DATABASE.md` §RAG note) → passed to LLM → assistant message persisted.
**Error cases**: `404 CHAT_001` session not found; `429 CHAT_002` rate limit on AI calls exceeded.

### `GET /lessons/:id/questions`
**Response** `200`
```json
{
  "success": true,
  "data": [
    {
      "id": "lq_1",
      "lessonId": "lesson_1",
      "studentId": "student_1",
      "content": "Why does this example use recursion instead of a loop?",
      "createdAt": "2026-07-20T10:00:00.000Z",
      "student": { "id": "student_1", "fullName": "Jane Doe" },
      "answers": [
        {
          "id": "la_1",
          "questionId": "lq_1",
          "authorId": "instr_1",
          "content": "Recursion mirrors the problem's self-similar structure more directly here.",
          "createdAt": "2026-07-20T11:00:00.000Z",
          "author": { "id": "instr_1", "fullName": "Prof X", "role": "INSTRUCTOR" }
        }
      ]
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 1 }
}
```
**Error cases**: `404 COURSE_007` if the lesson doesn't exist; `403 AUTH_003` if the caller is neither enrolled nor the owning instructor.

### `GET /instructor/analytics/overview`
**Response** `200`
```json
{
  "success": true,
  "data": {
    "totals": {
      "totalCourses": 2,
      "totalStudents": 15,
      "totalRevenue": 400,
      "averageRating": 4.6
    },
    "courses": [
      {
        "id": "course_1",
        "title": "Intro to Algebra",
        "enrolledCount": 10,
        "completionRate": 0.4,
        "revenue": 300,
        "averageRating": 5,
        "reviewCount": 4
      }
    ]
  }
}
```
`averageRating` at both the course and totals level is `null` when there are no reviews yet; `completionRate` is `0` (not `null`) when there are no enrollments.

### `POST /courses/:id/enroll`
**Response** `201`
```json
{ "success": true, "data": { "enrollmentId": "enr_5", "status": "ACTIVE" } }
```
**Error cases**: `409 ENROLLMENT_001` already enrolled; `402 PAYMENT_001` if course is paid and no completed order exists.

## [Tech-Specific Additions]

- **WebSocket events** (NestJS `@WebSocketGateway`, namespace `/realtime`):
  - `notification.new` — pushed when a `Notification` row is created (server → client).
  - `chat.message.stream` — streams AI response tokens for `/chat/sessions/:id/messages` instead of waiting for full completion.
  - Auth: WS handshake requires `accessToken` in connection query (`?token=`), validated by a WS-specific guard.
- **No GraphQL/gRPC** in this phase — REST only, kept consistent with the feature-based module boundaries in `ARCHITECTURE.md`. Revisit GraphQL only if the frontend needs flexible nested queries (e.g., course + modules + lessons + progress in one call) that would otherwise require chained REST calls.
