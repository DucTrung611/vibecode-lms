# Reviews Feature

## Purpose
Course reviews: public listing of a course's reviews, and a one-review-per-enrolled-student posting flow.

## Owned Entities
- `Review` (`reviews` table)

## Endpoints Implemented (API_SPEC.md §6 Reviews)
| Method | Path | Status |
|---|---|---|
| GET | `/courses/:id/reviews` | ✅ |
| POST | `/courses/:id/reviews` | ✅ |

Both endpoints implemented — nothing skipped. Both live under the `courses` URL path per spec but are owned/implemented by this feature (`ReviewsController`), the same split pattern `enrollment`'s `EnrollController` and `courses`' `ModulesController` already use for nested `/courses/:id/...` routes.

## Public API (for other features to inject)
- `ReviewsService` — exported via `ReviewsModule.exports`. No other feature consumes it yet; nothing in `API_SPEC.md`/`DATABASE.md` currently needs review data outside this feature (e.g. no "average rating" surfaced on the course catalog) — not added preemptively (YAGNI).

This feature injects `CoursesService` (from `CoursesModule`) and `EnrollmentService` (from `EnrollmentModule`) — never their repositories directly.

## Design Decisions
- **`GET /courses/:id/reviews` validates the course exists** (`CoursesService.findById`, throws `COURSE_004`) before listing — consistent with every other nested `/courses/:id/...` read in this codebase; a bad course id returns `404`, not an empty list, matching how `courses`' own nested routes behave.
- **Enrollment required to post**: `API_SPEC.md`'s auth column says "Enrolled student" for `POST /courses/:id/reviews`, enforced via `EnrollmentService.isEnrolled` — same `403 AUTH_003` reuse pattern `quizzes`/`assignments` already established for this exact phrase in the spec.
- **One review per student per course**: `reviews` has `unique(studentId, courseId)` in `DATABASE.md`. `create()` checks `findByStudentAndCourse` first and rejects a second attempt with `409 REVIEW_001` rather than upserting — there's no "edit my review" endpoint in `API_SPEC.md`, so silently overwriting would hide that from the API surface, the same reasoning `assignments` used for one-submission-per-student.
- **Review listing includes a `student` summary** (`id`, `fullName`) via `include: { student: true }` — a public review list without knowing who wrote it isn't useful; matches the same "include a summary of the related entity" pattern `enrollment`'s `EnrollmentEntity.course` and `certificates`' `CertificateEntity.course`/`student` already use.
- **No `update-review.dto.ts`**: no `PATCH`/`DELETE` review endpoint exists in `API_SPEC.md` for this phase — the usual anatomy's update DTO didn't apply, same deviation `enrollment`/`certificates` documented for their own missing DTOs.

## Error Codes
Reuses `COURSE_004` (404, course not found) and `AUTH_003` (403, not enrolled). Adds one new code, following the `REVIEW_[NUMBER]` format (not yet in `API_SPEC.md` §5):

| Code | HTTP | Meaning |
|---|---|---|
| `REVIEW_001` | 409 | Student has already reviewed this course |

`share-docs/API_SPEC.md` §5 should be updated to include `REVIEW_001` the next time it's revised.

## Known Constraints / Deferred
- No edit/delete review endpoint — not in `API_SPEC.md` for this phase.
- No aggregate rating (average/count) surfaced anywhere (e.g. on `Course`) — `courses` doesn't expose one and nothing in `DATABASE.md` computes it; would need a new field or a join computed at read time in `courses`, out of scope for this feature to add unilaterally.
- No moderation (reporting/removing inappropriate reviews) — not in `API_SPEC.md`.
