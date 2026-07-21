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
| POST | `/lessons/:id/quizzes/generate` | ✅ |

`POST /lessons/:id/quizzes/generate` (AI-generate quiz) is now implemented, using the shared `AiClientService` (`core/ai/`, see its own module for the "no AI client existed" reasoning that used to block this route). It requires `AI_PROVIDER_API_KEY`/`AI_PROVIDER_BASE_URL` to be configured — `AiClientService.complete()` throws `AI_001` (503) otherwise, which this endpoint does **not** catch/fall back from (unlike `ai-chatbot`'s reply generation): there is no non-AI way to "generate" a quiz, so a clear 503 is more honest than a fake fallback.

## Public API (for other features to inject)
- `QuizzesService` — exported via `QuizzesModule.exports`. No other feature consumes it yet; `certificates` may eventually want to check "all required quizzes passed" before issuing a certificate, but no such requirement exists in `API_SPEC.md`/`DATABASE.md` yet (not added preemptively — YAGNI).

This feature injects `CoursesService` (from `CoursesModule`), `EnrollmentService` (from `EnrollmentModule`), and `AiClientService` (from the global `CoreModule`) — never their repositories directly.

## Design Decisions
- **Enrollment check**: `GET /quizzes/:id` and `POST /quizzes/:id/attempts` require the caller to be enrolled in the quiz's course. Since `Quiz.lessonId` is nullable and a quiz only reaches a course through `lesson → module → course`, the service resolves it via the new `CoursesService.findCourseIdByLessonId(lessonId)` (throws `COURSE_007` if the lesson is gone) and then `EnrollmentService.isEnrolled(studentId, courseId)`. **If `lessonId` is null** (a quiz not attached to any lesson), there is no course to check against, so any authenticated student may access it — documented here since it's a deliberate gap, not an oversight.
- **Hiding answers**: `QuestionOptionEntity` intentionally omits `isCorrect` — `GET /quizzes/:id` must not leak which option is correct (per `API_SPEC.md`: "Quiz detail (questions, no answers)"). The grading path (`gradeAttempt` in `utils/scoring.util.ts`) reads `isCorrect` straight off the Prisma row, bypassing the entity.
- **TEXT questions are never auto-correct**: `QuestionType.TEXT` has no stored correct answer to compare against (only `QuestionOption.isCorrect` exists, which doesn't apply to free-text). `gradeAttempt` always scores TEXT answers as incorrect (0 points) — manual/AI grading is a future feature, not built here.
- **Multiple attempts allowed**: `POST /quizzes/:id/attempts` always creates a new `QuizAttempt` row; nothing in `DATABASE.md` defines a max-attempts constraint, so none is enforced.
- **Scoring**: `score = round(earnedPoints / totalPoints * 100)`, where `totalPoints` sums every question's `points` on the quiz (not just answered ones — an unanswered question stays unscored and drags the percentage down). `passed = score >= quiz.passScore`. Only questions present in the submitted `answers` array appear in the response `answers` list, matching the request/response shapes documented in `API_SPEC.md` §7 exactly.
- **No `create-quiz.dto.ts`**: no endpoint creates a quiz manually — only `POST /lessons/:id/quizzes/generate` (AI-only, via `GenerateQuizDto`) creates one. The usual anatomy's plain create DTO didn't apply, same deviation `enrollment` documented for its missing `create-enrollment.dto.ts`.
- **`POST /lessons/:id/quizzes/generate` ownership check**: resolves the lesson's course via `CoursesService.findCourseIdByLessonId`, then `CoursesService.findById(courseId).instructorId` must match the caller — same "service layer checks ownership, not the guard" pattern `courses` itself uses for `PATCH/DELETE /courses/:id`.
- **AI response contract**: the model is instructed to return *only* JSON (`utils/quiz-prompt.util.ts` builds the prompt); `utils/parse-generated-quiz.util.ts` defensively strips a markdown code fence if present anyway (LLMs often add one despite instructions not to) and validates every question/option shape before anything touches the database — an unparseable or malformed response throws `QUIZ_004` (502) rather than silently creating a broken quiz. Generated questions are always `SINGLE_CHOICE`/`MULTIPLE_CHOICE` (never `TEXT`, which has no auto-gradable correct answer per this feature's own scoring rule above).
- **Generated quiz response includes `isCorrect`** (`entities/generated-quiz.entity.ts`, a deliberately separate entity from `QuizEntity`/`QuestionEntity`) — unlike the student-facing `GET /quizzes/:id`, this endpoint is instructor-only and the instructor just generated the quiz, so they need to see which option the AI marked correct in order to review it before students see it.
- **Default `passScore` is 70** for AI-generated quizzes — not specified anywhere in `API_SPEC.md`/`DATABASE.md`; chosen as a reasonable default since there's no per-request field for it and no instructor-editing endpoint yet to change it after the fact (see Known Constraints).

## Error Codes
Reuses `AUTH_003` (403 — both "not enrolled" and "attempt belongs to someone else", matching the exact wording `API_SPEC.md` §7 already uses for the submit endpoint). Adds two new codes, following the `QUIZ_[NUMBER]` format (`QUIZ_002` and the descriptions for `QUIZ_003` were already named in `API_SPEC.md` §5/§7; `QUIZ_001` was unused):

| Code | HTTP | Meaning |
|---|---|---|
| `QUIZ_001` | 404 | Quiz not found |
| `QUIZ_003` | 404 | Attempt not found (already named in `API_SPEC.md` §7, now implemented) |
| `QUIZ_004` | 502 | AI provider returned a response that couldn't be parsed into valid quiz questions |

`QUIZ_002` (409, already-submitted) was already in `API_SPEC.md` §5 and is used as documented. `COURSE_007` (404, lesson not found) was added to the `courses` feature to support `findCourseIdByLessonId` — see its `context.md`. `AI_001` (503, provider not configured) and `AI_002` (502, provider request failed) come from `core/ai/ai-client.service.ts` and can also surface from this endpoint.

`share-docs/API_SPEC.md` §5 should be updated to include `QUIZ_001`, `QUIZ_004`, and `COURSE_007` the next time it's revised.

## Known Constraints / Deferred
- No quiz/question authoring endpoints (create/update/delete quiz, questions, options, or editing an AI-generated one after the fact) — `API_SPEC.md` only ever creates quizzes via the AI-generate route. Manual authoring would need new endpoints not yet specified.
- No time-limit enforcement — `Quiz.timeLimitSec` is stored and returned but nothing currently rejects a submission made after the limit; not specified in `API_SPEC.md`.
- **AI-generate is unverified against a live provider** — built and unit-tested against a mocked `AiClientService`/`fetch` response (see `core/ai/context` reasoning in `ai-chatbot/context.md`); nobody building this had real `AI_PROVIDER_API_KEY`/`AI_PROVIDER_BASE_URL` credentials to exercise it end-to-end against an actual model. The JSON-contract prompt and defensive parser (`utils/parse-generated-quiz.util.ts`) are the safety net for whatever a real model actually returns, but real-provider quirks (different JSON dialects, refusals, truncation) may need prompt/parser adjustments once tested live.
