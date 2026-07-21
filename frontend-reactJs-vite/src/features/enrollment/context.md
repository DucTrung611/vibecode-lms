# Enrollment Feature (Frontend)

## Purpose
Student enrollment in courses (`EnrollButton`, composed into the `courses` feature's `CourseDetailPage`) and a "My courses" list (`/my-courses`). Progress tracking (`useUpdateProgress`) is exported for cross-feature use and is now called from `courses`' `LessonPage` (`/courses/:courseId/lessons/:lessonId`) — this feature still owns no lesson-viewing UI itself, by design (see Design Decisions).

## Endpoints Consumed
| Method | Path | Used by |
|---|---|---|
| POST | `/courses/:id/enroll` | `useEnroll` |
| GET | `/enrollments/me` | `useMyEnrollments` |
| PATCH | `/enrollments/:id/progress` | `useUpdateProgress` |

All 3 endpoints from `API_SPEC.md` §Enrollment are consumed by hooks; `useUpdateProgress` is called from `courses`' `LessonPage`.

## Public API (via `index.ts`)
- `EnrollButton` — the only cross-feature component export; composed directly into `courses/pages/CourseDetailPage.tsx` (`courses` imports it from this barrel, per `FE-PROJECT-RULES.md` §3 — never reaching into this feature's internal files)
- `enrollmentRoutes` — consumed by `app/routes/router.tsx`
- `useEnroll`, `useMyEnrollments`, `useUpdateProgress`
- Types: `Enrollment`, `LessonProgress`, `UpdateProgressPayload`

## Design Decisions
- **`EnrollButton` has three states** based on `useAuthStore().user`: unauthenticated → "Sign in to enroll" link; authenticated but not `STUDENT` → renders nothing (instructors can't enroll — matches the backend's `@Roles('STUDENT')` guard, avoids a button that would just 403); `STUDENT` → the actual enroll button, showing "Enrolled ✓" once the mutation succeeds.
- **No "already enrolled" pre-check**: the button doesn't fetch `/enrollments/me` just to know whether to disable itself — the server is the source of truth. A student re-clicking on an already-enrolled course surfaces the backend's `409 ENROLLMENT_001` as a toast ("Already enrolled in this course"), which is a fine, low-frequency edge case rather than an extra network round-trip on every course-detail view.
- **`useMyEnrollments` is `enabled: Boolean(accessToken)`** the same way `identity`'s `useCurrentUser` is — avoids firing the request before login.
- **No lesson-viewer/video-player UI owned by this feature** — that page (`LessonPage`) lives in `courses` instead, since lesson content (title, type, `videoUrl`/`content`, module ordering) is entirely `courses`-owned data; this feature only supplies the `enrollmentId` lookup (`useMyEnrollments`) and the progress-update call (`useUpdateProgress`) that `LessonPage` composes via this barrel — same cross-feature-via-barrel pattern used everywhere else, just with `courses` as the consumer this time instead of the usual direction.

## Known Constraints / Deferred
- **No pagination controls on `/my-courses`** — `useMyEnrollments` accepts `page`/`limit` params and the backend paginates, but the page itself always requests page 1; add a `CoursePagination`-style control (reuse the one in `courses`? or promote it to `shared/components` once a second feature needs it) once a real user has enough enrollments to need it. This same "always page 1" limitation is also why `LessonPage` (in `courses`) can fail to find a student's `enrollmentId` if they have more than a page's worth of enrollments.
