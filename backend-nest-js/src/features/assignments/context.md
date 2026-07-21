# Assignments Feature

## Purpose
File/text assignment submission flow for enrolled students, plus instructor grading: view an assignment, submit work once, have it graded with a score and feedback.

## Owned Entities
- `Assignment` (`assignments` table)
- `AssignmentSubmission` (`assignment_submissions` table)

## Endpoints Implemented (API_SPEC.md §6 Assignments)
| Method | Path | Status |
|---|---|---|
| GET | `/assignments/:id` | ✅ |
| POST | `/assignments/:id/submissions` | ✅ |
| PATCH | `/submissions/:id/grade` | ✅ |
| GET | `/assignments/:id/submissions` | ✅ |

All 3 spec'd endpoints implemented, plus `GET /assignments/:id/submissions` (instructor-only submission listing) added beyond `API_SPEC.md` to close a real gap: without it, an instructor had no way to discover a submission's `id` to call `PATCH /submissions/:id/grade` at all.

## Public API (for other features to inject)
- `AssignmentsService` — exported via `AssignmentsModule.exports`. No other feature consumes it yet; `certificates` may eventually want "all required assignments graded/passed" before issuing a certificate, but that's not in `API_SPEC.md`/`DATABASE.md` yet — not added preemptively (YAGNI, same reasoning `quizzes` used).

This feature injects `CoursesService` (from `CoursesModule`) and `EnrollmentService` (from `EnrollmentModule`) — never their repositories directly.

## Design Decisions
- **Enrollment check on all three endpoints, not just `GET`**: `API_SPEC.md`'s auth column only says "Enrolled student" for `GET /assignments/:id` and plain "Student" for `POST /assignments/:id/submissions` — but a student who isn't enrolled has no business submitting work for the course, so `submit()` enforces the same `EnrollmentService.isEnrolled` check as `findById()`. This mirrors the same extension `quizzes` made to its own submit-adjacent endpoints, and `Assignment.lessonId` is non-nullable (unlike `Quiz.lessonId`), so there's no "no course to check" escape hatch here — every assignment has one.
- **Grading requires course ownership, not just the `INSTRUCTOR` role**: `PATCH /submissions/:id/grade` resolves `submission → assignment → lesson → course` (via `AssignmentRepository.findByIdWithCourse` then `CoursesService.findById`) and checks `course.instructorId === graderId`, the same ownership-in-service-layer pattern `courses` uses for `PATCH/DELETE /courses/:id`. `RolesGuard` alone only confirms "some instructor," not "the instructor who owns this course."
- **One submission per student per assignment**: `assignment_submissions` has `unique(assignmentId, studentId)` in `DATABASE.md`. `submit()` checks for an existing row and rejects a second attempt with `409 ASSIGNMENT_002` rather than upserting — there's no "resubmit"/"update submission" endpoint in `API_SPEC.md`, so overwriting silently would hide that fact from the API surface.
- **Late-submission rule**: reuses the already-named `400 ASSIGNMENT_003` ("Submission after due date without late-submission policy") from `API_SPEC.md` §5. Since `DATABASE.md`'s `assignments` table has no late-policy field at all, "without late-submission policy" is unconditionally true today — any submission after `dueDate` is rejected. Revisit if a policy field is ever added to the schema.
- **Score cannot exceed `maxScore`**: validated in the service (not the DTO — `maxScore` is per-assignment, not a static rule `class-validator` can express), throwing the new `400 ASSIGNMENT_006`.
- **`fileUrl`/`content` — at least one required**: enforced in the service (`400 ASSIGNMENT_005`) rather than a DTO-level "at least one of" validator, matching the project's existing preference for simple per-field decorators over custom validator classes.
- **`GET /assignments/:id/submissions` overrides the controller's class-level `@Roles('STUDENT')` with its own method-level `@Roles('INSTRUCTOR')`** — `AssignmentsController` is otherwise entirely student-facing, but Nest's `RolesGuard` reads `getAllAndOverride` (handler wins over class), so a single method-level override was simpler than splitting this route into a new controller (the way `quizzes` split `LessonQuizzesController` out for its own instructor-only generate route — that case had a different URL prefix entirely, `/lessons/*` vs `/quizzes/*`, so a new controller was unavoidable there; here the path (`/assignments/:id/submissions`) already belongs to this controller).
- **Ownership check reuses the exact same resolve-course-then-compare-instructorId logic as `gradeSubmission`** — both need "does this instructor own the course this assignment belongs to," just entered from different sides (`submissionId → assignment` vs `assignmentId` directly).
- **Submission list includes each row's `student: { id, fullName }`** (`AssignmentSubmissionEntity.student`, optional, populated only when the repository's include is used) — an instructor grading needs to know *whose* submission they're looking at; the single-submission paths (`create`/`grade`) don't need it since the caller already has that context.

## Error Codes
Reuses `ASSIGNMENT_003` (400, already in `API_SPEC.md` §5, now implemented as documented) and `AUTH_003` (403, both "not enrolled" and "not the owning instructor," consistent with how `courses`/`quizzes` reuse it). Adds four new codes, following the `ASSIGNMENT_[NUMBER]` format:

| Code | HTTP | Meaning |
|---|---|---|
| `ASSIGNMENT_001` | 404 | Assignment not found |
| `ASSIGNMENT_002` | 409 | Already submitted (violates the `(assignmentId, studentId)` unique constraint) |
| `ASSIGNMENT_004` | 404 | Submission not found (`PATCH /submissions/:id/grade` with a bad `:id`) |
| `ASSIGNMENT_005` | 400 | Submission has neither `fileUrl` nor `content` |
| `ASSIGNMENT_006` | 400 | `score` exceeds the assignment's `maxScore` |

`share-docs/API_SPEC.md` §5 should be updated to include `ASSIGNMENT_001`, `ASSIGNMENT_002`, `ASSIGNMENT_004`, `ASSIGNMENT_005`, `ASSIGNMENT_006` the next time it's revised.

## Known Constraints / Deferred
- No resubmission/update-submission endpoint — see "one submission per student" above.
- No file upload — `fileUrl` is a plain string field, same deferred-upload pattern `courses` already documented for `thumbnailUrl`/lesson `Resource`.
