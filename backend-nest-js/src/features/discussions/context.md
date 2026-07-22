# Discussions Feature

## Purpose
Lesson-level Q&A: enrolled students ask questions on a lesson, and enrolled students or the owning instructor answer them.

## Owned Entities
- `LessonQuestion` (`lesson_questions` table)
- `LessonAnswer` (`lesson_answers` table)

## Endpoints Implemented (API_SPEC.md §6 Discussions)
| Method | Path | Status |
|---|---|---|
| GET | `/lessons/:id/questions` | ✅ |
| POST | `/lessons/:id/questions` | ✅ |
| POST | `/questions/:id/answers` | ✅ |

Split across two controllers (`LessonQuestionsController` under `/lessons`, `QuestionAnswersController` under `/questions`) — same per-resource controller split `courses` uses for `ModulesController`/`CategoriesController`.

## Public API (for other features to inject)
- `DiscussionsService` — exported via `DiscussionsModule.exports`. Not consumed by any other feature yet (YAGNI, same as `ReviewsService`).

This feature injects `CoursesService` (from `CoursesModule`) and `EnrollmentService` (from `EnrollmentModule`) — never their repositories directly.

## Design Decisions
- **No `isInstructorAnswer` column**: an answer's author role is derived at read time from `User.role` (embedded as `author.role` on the response), not denormalized onto `LessonAnswer`. Avoids a flag that could go stale if a user's role ever changed.
- **Access to view/post is "enrolled student or owning instructor"**, mirroring how the lesson itself is gated on the frontend (`LessonPage.tsx`'s `isOwner || enrollment` check) and the same `EnrollmentService.isEnrolled` pattern `quizzes.service.ts#assertEnrolled` established. Ownership is checked inline (`CoursesService.findById(courseId).instructorId === userId`) rather than via a new shared method — same duplicated-inline-check idiom already used by `quizzes.service.ts#generateFromLesson`, not something to newly abstract for a second caller.
- **Only students can start a question** (`@Roles('STUDENT')` on `POST /lessons/:id/questions`); both students and instructors can answer (`POST /questions/:id/answers` has no `@Roles` restriction — the service branches on `userRole` to apply either the enrollment check or the ownership check).
- **List response nests answers** (`include: { answers: { include: { author } } }`) rather than requiring a separate per-question detail call — expected thread size per lesson is small, and this matches the nested-include precedent `courses.repository.ts#findByIdWithDetail` already uses for modules→lessons.
- **No update/delete endpoints** — not needed for this phase, same deviation `reviews` documented for its own missing DTOs.

## Error Codes
Reuses `COURSE_004`/`COURSE_007` (404) and `AUTH_003` (403, not enrolled/not owner). Adds one new code, following the `DISCUSSION_[NUMBER]` format (not yet in `API_SPEC.md` §5 as of this feature's addition — added alongside it):

| Code | HTTP | Meaning |
|---|---|---|
| `DISCUSSION_001` | 404 | Question not found (answering a missing question id) |

## Known Constraints / Deferred
- No edit/delete for questions or answers.
- No notification fired when a question gets answered — `notifications` isn't wired up to this feature; would be a natural follow-up via an event (`discussion.answered`) if needed later.
- No upvoting/best-answer marking.
