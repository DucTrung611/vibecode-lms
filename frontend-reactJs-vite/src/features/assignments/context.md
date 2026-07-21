# Assignments Feature (Frontend)

## Purpose
Two standalone flows against the backend's `assignments` feature: a student submitting work at `/assignments/:id/submit`, and an instructor grading a submission at `/submissions/:id/grade`.

## Endpoints Consumed
| Method | Path | Used by |
|---|---|---|
| GET | `/assignments/:id` | `useAssignment` |
| POST | `/assignments/:id/submissions` | `useSubmitAssignment` |
| PATCH | `/submissions/:id/grade` | `useGradeSubmission` |

All 3 backend endpoints are consumed.

## Public API (via `index.ts`)
- `assignmentRoutes` — consumed by `app/routes/router.tsx`
- `useAssignment`, `useSubmitAssignment`, `useGradeSubmission`
- Types: `Assignment`, `AssignmentSubmission`

## Design Decisions
- **`GradeSubmissionPage` cannot show the student's submitted work** — `API_SPEC.md` has no `GET /submissions/:id` (only the `PATCH .../grade` action exists), so there is no endpoint this page could call to fetch `fileUrl`/`content`/`submittedAt` for the submission being graded. The page is a blind grading form (score + feedback only) with an explicit on-page note explaining the gap, rather than silently pretending the flow is complete. This needs a backend endpoint added to `API_SPEC.md` before the grading page is actually usable by an instructor.
- **No "already submitted" check on load**: like the missing GET-by-submission gap above, there's also no "my submission for this assignment" endpoint, so `AssignmentSubmitPage` can't tell on page load whether the student already submitted — it always shows the form. A second submission attempt surfaces the backend's `409 ASSIGNMENT_002` as a toast, and the success confirmation shown after a submit is only remembered for the current page visit (lost on reload) — same category of limitation `enrollment` and `quizzes` already documented for their own flows.
- **`useAssignment` gated on `accessToken`**, matching `useQuiz`/`useMyEnrollments`.
- **Submission and grading forms use `react-hook-form` + `zod`** (`SubmissionForm`, `GradeForm`), consistent with `courses`' `CourseForm` — not the plain-`useState` pattern `quizzes` uses for its answer inputs, because these are real validated forms (URL format, "at least one of fileUrl/content", non-negative score), not a dynamic list of per-question inputs.

## Known Constraints / Deferred
- ~~No discovery path from a course/lesson to an assignment~~ **Closed** for the student-facing side: `courses`' `CourseModuleList` now renders a "View assignment" link to `/assignments/:id/submit` using the backend's new `Lesson.assignmentId` field (see backend `courses/context.md`). The submission's grading link (`/submissions/:id/grade`) is still undiscoverable — see below.
- **No submission-listing UI for instructors** — matches the backend's own deferred "list submissions for this assignment" endpoint; an instructor needs a submission `id` from elsewhere to reach `/submissions/:id/grade`.
- ~~No file upload~~ **Closed**: `SubmissionForm`'s `fileUrl` field now has a `shared/components/FileUploadButton.tsx` next to it, same pattern `identity`'s `ProfileForm` and `courses`' `CourseForm`/`AddLessonForm` use.
