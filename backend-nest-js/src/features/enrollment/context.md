# Enrollment Feature

## Purpose
Student enrollment in courses and per-lesson progress tracking, including automatic completion of the enrollment once every lesson in the course is marked complete.

## Owned Entities
- `Enrollment` (`enrollments` table)
- `LessonProgress` (`lesson_progress` table)

## Endpoints Implemented (API_SPEC.md §6 Enrollment)
| Method | Path | Status |
|---|---|---|
| POST | `/courses/:id/enroll` | ✅ |
| GET | `/enrollments/me` | ✅ |
| PATCH | `/enrollments/:id/progress` | ✅ |

All 3 endpoints implemented — nothing skipped. `POST /courses/:id/enroll` lives under the `courses` URL path per spec but is owned/implemented by this feature (`EnrollController`), the same split pattern `courses` itself uses for `ModulesController`.

## Public API (for other features to inject)
- `EnrollmentService` — exported via `EnrollmentModule.exports`. No other feature consumes it yet, but `quizzes`/`assignments` will need it later to verify "enrolled student" auth (per `API_SPEC.md`'s `Auth: Enrolled student` column) — expect a method like `isEnrolled(studentId, courseId): Promise<boolean>` to be added when that feature is built; not added preemptively here (YAGNI).

This feature injects `CoursesService` (from `CoursesModule`, imported in `EnrollmentModule`) — never `CourseRepository` directly.

## Design Decisions
- **Payment gate**: `POST /courses/:id/enroll` throws `402 PAYMENT_001` (already named in `API_SPEC.md` §7) whenever `course.price > 0`. There is no `payments` feature yet, so "no completed order exists" is always true for a paid course — this is a correct, if conservative, stand-in until Payments is built (free courses enroll immediately).
- **Enroll response shape**: `API_SPEC.md` §7 documents `POST /courses/:id/enroll` returning `{ enrollmentId, status }` (not the generic `{ id, ... }` shape other entities use) — the controller maps `EnrollmentEntity` to that exact shape rather than changing the entity's field names app-wide.
- **Progress upsert**: `PATCH /enrollments/:id/progress` upserts a `LessonProgress` row keyed on `(enrollmentId, lessonId)` — first call for a given lesson creates it (default status `IN_PROGRESS` if omitted), later calls update in place. `lessonId` is validated against the enrolled course's actual lessons (via `CoursesService.findById`) — a lesson from a different course is rejected with `ENROLLMENT_003`, not silently accepted.
- **Auto-completion**: after every progress upsert, the service recomputes whether *all* of the course's lessons now have a `COMPLETED` `LessonProgress` row for this enrollment; if so, the enrollment itself flips to `COMPLETED` with `completedAt` set. This is monotonic in this MVP — un-completing a lesson afterward does not revert an already-completed enrollment (deliberately simple; revisit if a real requirement for "resume mid-course" reappears).
- **Ownership check**: `PATCH /enrollments/:id/progress` verifies `enrollment.studentId === currentUser.id` in the service layer (same pattern as `courses`' instructor-ownership check) — `RolesGuard` only confirms the caller is a `STUDENT`, not that they own *this* enrollment.
- **No `create-enrollment.dto.ts`**: `POST /courses/:id/enroll` takes no request body (`courseId` from the route param, `studentId` from the JWT) — the usual anatomy's DTO pair didn't apply here.

## Error Codes
Reuses `ENROLLMENT_001` (409, already-enrolled — already in `API_SPEC.md` §5) and `AUTH_003` (403, ownership). Reuses `PAYMENT_001` (402), which `API_SPEC.md` §7 already names in the endpoint details for this exact route, even though it isn't yet in the §5 table. Adds two new codes, following the same `ENROLLMENT_[NUMBER]` format:

| Code | HTTP | Meaning |
|---|---|---|
| `ENROLLMENT_002` | 404 | Enrollment not found (`PATCH /enrollments/:id/progress` with a bad `:id`) |
| `ENROLLMENT_003` | 404 | `lessonId` does not belong to the enrolled course |

`share-docs/API_SPEC.md` §5 should be updated to include `PAYMENT_001`, `ENROLLMENT_002`, and `ENROLLMENT_003` the next time it's revised.

## Known Constraints / Deferred
- No "unenroll" endpoint — not in `API_SPEC.md` for this phase.
- No certificate issuance on completion — that's the `certificates` feature's job (via a domain event later, per `BE-ARCHITECTURE.md` §5's `enrollment.completed` example); not wired here since `certificates` doesn't exist yet.
- No tests yet for this feature — deferred to the same follow-up pass as `courses`.
