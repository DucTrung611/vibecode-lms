# Quizzes Feature

## Purpose
Quiz-taking flow for enrolled students: view a quiz's questions (answers hidden), start an attempt, submit answers for auto-grading and pass/fail scoring.

## Owned Entities
- `Quiz` (`quizzes` table)
- `Question` (`questions` table)
- `QuestionOption` (`question_options` table)
- `QuizAttempt` (`quiz_attempts` table)
- `QuizAnswer` (`quiz_answers` table)

All five exist only as reads/writes in service of the three endpoints below — there is no standalone quiz/question authoring endpoint yet (see Known Constraints).

## Endpoints Implemented (API_SPEC.md §6 Quizzes)
| Method | Path | Status |
|---|---|---|
| GET | `/quizzes/:id` | ✅ |
| POST | `/quizzes/:id/attempts` | ✅ |
| POST | `/attempts/:id/submit` | ✅ |
| POST | `/lessons/:id/quizzes/generate` | ❌ deferred |

`POST /lessons/:id/quizzes/generate` (AI-generate quiz) is **not implemented**: there is no AI provider client anywhere in the codebase yet (only placeholder `AI_PROVIDER_API_KEY`/`AI_PROVIDER_BASE_URL` config in `configuration.ts`, unused). Building it now would mean inventing a provider integration with no precedent — same reasoning `courses` used to defer file uploads. Revisit once `ai-chatbot` (or a shared AI client) exists.

## Public API (for other features to inject)
- `QuizzesService` — exported via `QuizzesModule.exports`. No other feature consumes it yet; `certificates` may eventually want to check "all required quizzes passed" before issuing a certificate, but no such requirement exists in `API_SPEC.md`/`DATABASE.md` yet (not added preemptively — YAGNI).

This feature injects `CoursesService` (from `CoursesModule`) and `EnrollmentService` (from `EnrollmentModule`) — never their repositories directly.

## Design Decisions
- **Enrollment check**: `GET /quizzes/:id` and `POST /quizzes/:id/attempts` require the caller to be enrolled in the quiz's course. Since `Quiz.lessonId` is nullable and a quiz only reaches a course through `lesson → module → course`, the service resolves it via the new `CoursesService.findCourseIdByLessonId(lessonId)` (throws `COURSE_007` if the lesson is gone) and then `EnrollmentService.isEnrolled(studentId, courseId)`. **If `lessonId` is null** (a quiz not attached to any lesson), there is no course to check against, so any authenticated student may access it — documented here since it's a deliberate gap, not an oversight.
- **Hiding answers**: `QuestionOptionEntity` intentionally omits `isCorrect` — `GET /quizzes/:id` must not leak which option is correct (per `API_SPEC.md`: "Quiz detail (questions, no answers)"). The grading path (`gradeAttempt` in `utils/scoring.util.ts`) reads `isCorrect` straight off the Prisma row, bypassing the entity.
- **TEXT questions are never auto-correct**: `QuestionType.TEXT` has no stored correct answer to compare against (only `QuestionOption.isCorrect` exists, which doesn't apply to free-text). `gradeAttempt` always scores TEXT answers as incorrect (0 points) — manual/AI grading is a future feature, not built here.
- **Multiple attempts allowed**: `POST /quizzes/:id/attempts` always creates a new `QuizAttempt` row; nothing in `DATABASE.md` defines a max-attempts constraint, so none is enforced.
- **Scoring**: `score = round(earnedPoints / totalPoints * 100)`, where `totalPoints` sums every question's `points` on the quiz (not just answered ones — an unanswered question stays unscored and drags the percentage down). `passed = score >= quiz.passScore`. Only questions present in the submitted `answers` array appear in the response `answers` list, matching the request/response shapes documented in `API_SPEC.md` §7 exactly.
- **No `create-quiz.dto.ts`**: no endpoint in this phase creates a quiz manually (only the deferred AI-generate route would) — the usual anatomy's create DTO didn't apply, same deviation `enrollment` documented for its missing `create-enrollment.dto.ts`.

## Error Codes
Reuses `AUTH_003` (403 — both "not enrolled" and "attempt belongs to someone else", matching the exact wording `API_SPEC.md` §7 already uses for the submit endpoint). Adds two new codes, following the `QUIZ_[NUMBER]` format (`QUIZ_002` and the descriptions for `QUIZ_003` were already named in `API_SPEC.md` §5/§7; `QUIZ_001` was unused):

| Code | HTTP | Meaning |
|---|---|---|
| `QUIZ_001` | 404 | Quiz not found |
| `QUIZ_003` | 404 | Attempt not found (already named in `API_SPEC.md` §7, now implemented) |

`QUIZ_002` (409, already-submitted) was already in `API_SPEC.md` §5 and is used as documented. `COURSE_007` (404, lesson not found) was added to the `courses` feature to support `findCourseIdByLessonId` — see its `context.md`.

`share-docs/API_SPEC.md` §5 should be updated to include `QUIZ_001` and `COURSE_007` the next time it's revised.

## Known Constraints / Deferred
- No quiz/question authoring endpoints (create/update/delete quiz, questions, options) — `API_SPEC.md` only ever creates quizzes via the deferred AI-generate route. Manual authoring would need new endpoints not yet specified.
- No time-limit enforcement — `Quiz.timeLimitSec` is stored and returned but nothing currently rejects a submission made after the limit; not specified in `API_SPEC.md`.
