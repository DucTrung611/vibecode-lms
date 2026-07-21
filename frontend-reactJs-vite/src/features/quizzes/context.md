# Quizzes Feature (Frontend)

## Purpose
Quiz-taking flow for a `STUDENT` at `/quizzes/:id/attempt`: view the quiz, start an attempt, answer questions, submit for grading, and see the pass/fail result.

## Endpoints Consumed
| Method | Path | Used by |
|---|---|---|
| GET | `/quizzes/:id` | `useQuiz` |
| POST | `/quizzes/:id/attempts` | `useStartAttempt` |
| POST | `/attempts/:id/submit` | `useSubmitAttempt` |

All 3 backend endpoints implemented in `backend-nest-js/src/features/quizzes` are consumed. `POST /lessons/:id/quizzes/generate` (AI-generate) has no frontend surface — the backend defers it too (no AI client exists yet).

## Public API (via `index.ts`)
- `quizRoutes` — consumed by `app/routes/router.tsx`
- `useQuiz`, `useStartAttempt`, `useSubmitAttempt`
- Types: `Quiz`, `Question`, `QuizAttempt`, `SubmitAttemptResult`

Nothing else is exported cross-feature yet — no other feature currently links to a quiz (see Known Constraints on discovery).

## Design Decisions
- **Attempt state lives in a Zustand store** (`stores/quiz.store.ts`: `attemptId`, `answers`), not component state — `QuizAttemptPage`, `QuizAttemptForm`, and `QuestionCard` all need it, and `FE-ARCHITECTURE.md` §7 explicitly calls out "in-progress quiz attempt" as the canonical example of feature-scoped Zustand state.
- **Three-phase page**: `QuizAttemptPage` renders `QuizCard` (not started) → `QuizAttemptForm` (`attemptId` set, not yet submitted) → `QuizResult` (`submitAttempt.isSuccess`) based on store/mutation state, rather than a separate route per phase — matches how `enrollment`'s single-page flows work.
- **`MULTIPLE_CHOICE` rendered as radio buttons**, same as `SINGLE_CHOICE`: the backend's `SubmitAnswerDto` only carries one `selectedOptionId` per answer (per `API_SPEC.md` §7's exact request shape), so the UI can't let a student pick more than one option without the backend being able to grade it. Matches the backend's own scoring limitation documented in its `context.md`.
- **`useQuiz` gated on `accessToken`**, same pattern as `useMyEnrollments`/`useCurrentUser` — avoids firing before login since every quiz endpoint requires auth.
- **`onRetake` just calls `reset()`** on the store (clears `attemptId`/`answers`), dropping back to the `QuizCard` phase so the student can call `POST /quizzes/:id/attempts` again — the backend allows unlimited attempts (no max-attempts constraint), so this is a real retake, not a dead end.

## Known Constraints / Deferred
- **No discovery path from a course/lesson to a quiz** — `courses`' `Lesson` type has no `quizId`, and the backend has no "list quizzes for a lesson" endpoint, so nothing links here yet. `/quizzes/:id/attempt` is reachable only by direct URL. Wiring a "Take Quiz" link into `CourseModuleList` needs a backend endpoint that doesn't exist in `API_SPEC.md` yet.
- **No quiz results history** — there's no `GET /quizzes/:id/attempts` or similar in `API_SPEC.md`, so a student can't review past attempts; only the just-submitted result is shown, and it's lost on navigation away.
- **No timer enforcement for `timeLimitSec`** — displayed on `QuizCard` but nothing counts down or auto-submits; the backend doesn't enforce it either (see backend `context.md`).
