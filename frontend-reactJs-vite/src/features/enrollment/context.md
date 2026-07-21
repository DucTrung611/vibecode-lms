# Enrollment Feature (Frontend)

## Purpose
Student enrollment in courses (`EnrollButton`, composed into the `courses` feature's `CourseDetailPage`) and a "My courses" list (`/my-courses`). Progress tracking (`useUpdateProgress`) is implemented at the data layer but not yet wired into any lesson-viewing UI — see Known Constraints.

## Endpoints Consumed
| Method | Path | Used by |
|---|---|---|
| POST | `/courses/:id/enroll` | `useEnroll` |
| GET | `/enrollments/me` | `useMyEnrollments` |
| PATCH | `/enrollments/:id/progress` | `useUpdateProgress` |

All 3 endpoints from `API_SPEC.md` §Enrollment are consumed by hooks, though `useUpdateProgress` has no caller yet (see below).

## Public API (via `index.ts`)
- `EnrollButton` — the only cross-feature component export; composed directly into `courses/pages/CourseDetailPage.tsx` (`courses` imports it from this barrel, per `FE-PROJECT-RULES.md` §3 — never reaching into this feature's internal files)
- `enrollmentRoutes` — consumed by `app/routes/router.tsx`
- `useEnroll`, `useMyEnrollments`, `useUpdateProgress`
- Types: `Enrollment`, `LessonProgress`, `UpdateProgressPayload`

## Design Decisions
- **`EnrollButton` has three states** based on `useAuthStore().user`: unauthenticated → "Sign in to enroll" link; authenticated but not `STUDENT` → renders nothing (instructors can't enroll — matches the backend's `@Roles('STUDENT')` guard, avoids a button that would just 403); `STUDENT` → the actual enroll button, showing "Enrolled ✓" once the mutation succeeds.
- **No "already enrolled" pre-check**: the button doesn't fetch `/enrollments/me` just to know whether to disable itself — the server is the source of truth. A student re-clicking on an already-enrolled course surfaces the backend's `409 ENROLLMENT_001` as a toast ("Already enrolled in this course"), which is a fine, low-frequency edge case rather than an extra network round-trip on every course-detail view.
- **`useMyEnrollments` is `enabled: Boolean(accessToken)`** the same way `identity`'s `useCurrentUser` is — avoids firing the request before login.

## Known Constraints / Deferred
- **No lesson-viewer/video-player UI** — `PATCH /enrollments/:id/progress` requires a `lessonId`, which only makes sense once there's a page presenting one lesson at a time to an enrolled student. That page doesn't exist yet (would need its own feature or a `courses`-owned lesson-viewing route); `useUpdateProgress` is exported and ready for whoever builds it, matching how `courses` pre-declared `findById` for this feature before it existed.
- **No pagination controls on `/my-courses`** — `useMyEnrollments` accepts `page`/`limit` params and the backend paginates, but the page itself always requests page 1; add a `CoursePagination`-style control (reuse the one in `courses`? or promote it to `shared/components` once a second feature needs it) once a real user has enough enrollments to need it.
- **No tests yet for this feature** — deferred to the same follow-up pass as `courses`/`identity`.
