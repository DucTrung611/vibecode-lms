# Assignments Feature (Frontend)

## Purpose
Three flows against the backend's `assignments` feature: a student submitting work at `/assignments/:id/submit`, an instructor browsing submissions at `/assignments/:id/submissions`, and an instructor grading one at `/submissions/:id/grade`.

## Endpoints Consumed
| Method | Path | Used by |
|---|---|---|
| GET | `/assignments/:id` | `useAssignment` |
| POST | `/assignments/:id/submissions` | `useSubmitAssignment` |
| GET | `/assignments/:id/submissions` | `useAssignmentSubmissions` |
| PATCH | `/submissions/:id/grade` | `useGradeSubmission` |

All 4 backend endpoints are consumed.

## Public API (via `index.ts`)
- `assignmentRoutes` — consumed by `app/routes/router.tsx`
- `useAssignment`, `useSubmitAssignment`, `useAssignmentSubmissions`, `useGradeSubmission`
- Types: `Assignment`, `AssignmentSubmission`

## Design Decisions
- **`GradeSubmissionPage` shows the student's submitted work only when navigated to from `AssignmentSubmissionsPage`** — via `<Link to={...} state={{ submission }}>`, read back with `useLocation().state`. There is still no `GET /submissions/:id` on the backend (only list-by-assignment and grade-by-id), so a direct visit to `/submissions/:id/grade` (bookmarked URL, page refresh) still can't fetch the submission and falls back to the same blind grading form as before, with an explanatory note. This is a real improvement over passing nothing, at the cost of only working when the in-app navigation path is used — documented rather than silently assumed.
- **`AssignmentSubmissionsPage` is reached from `courses`' `ModuleEditorCard`**: an ASSIGNMENT-type lesson with a linked `assignmentId` now renders a "View submissions" link (`/assignments/:id/submissions`) next to it in the instructor's course-edit view — closes the "instructor has no way to discover this page" gap the same way `CourseModuleList`'s "View assignment" link closed it for students.
- **No "already submitted" check on load**: like the missing GET-by-submission gap above, there's also no "my submission for this assignment" endpoint, so `AssignmentSubmitPage` can't tell on page load whether the student already submitted — it always shows the form. A second submission attempt surfaces the backend's `409 ASSIGNMENT_002` as a toast, and the success confirmation shown after a submit is only remembered for the current page visit (lost on reload) — same category of limitation `enrollment` and `quizzes` already documented for their own flows.
- **`useAssignment` gated on `accessToken`**, matching `useQuiz`/`useMyEnrollments`.
- **Submission and grading forms use `react-hook-form` + `zod`** (`SubmissionForm`, `GradeForm`), consistent with `courses`' `CourseForm` — not the plain-`useState` pattern `quizzes` uses for its answer inputs, because these are real validated forms (URL format, "at least one of fileUrl/content", non-negative score), not a dynamic list of per-question inputs.

## Known Constraints / Deferred
- ~~No discovery path from a course/lesson to an assignment~~ **Closed** on both sides now: `courses`' `CourseModuleList` links students to `/assignments/:id/submit`, and `ModuleEditorCard` links instructors to `/assignments/:id/submissions` (both use the backend's `Lesson.assignmentId` field, see backend `courses/context.md`).
- ~~No submission-listing UI for instructors~~ **Closed**: `AssignmentSubmissionsPage`.
- ~~No file upload~~ **Closed**: `SubmissionForm`'s `fileUrl` field now has a `shared/components/FileUploadButton.tsx` next to it, same pattern `identity`'s `ProfileForm` and `courses`' `CourseForm`/`AddLessonForm` use.
- ~~No pagination controls on `AssignmentSubmissionsPage`~~ **Closed**: now lifts `page` state and renders `shared/components/Pagination.tsx`, same as every other list page in this codebase.
