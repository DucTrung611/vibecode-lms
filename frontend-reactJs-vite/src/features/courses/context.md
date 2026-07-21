# Courses Feature (Frontend)

## Purpose
Public course catalog/detail, plus instructor authoring (create course, edit course, add modules/lessons). Owns `/courses`, `/courses/:id`, `/instructor/courses/new`, `/instructor/courses/:id/edit`.

## Endpoints Consumed
| Method | Path | Used by |
|---|---|---|
| GET | `/courses` | `useCourses` (catalog page) |
| GET | `/courses/:id` | `useCourse` (detail + edit pages) |
| POST | `/courses` | `useCreateCourse` |
| PATCH | `/courses/:id` | `useUpdateCourse` |
| DELETE | `/courses/:id` | `useDeleteCourse` |
| POST | `/courses/:id/modules` | `useAddModule` |
| POST | `/modules/:id/lessons` | `useAddLesson` |

All 7 endpoints from `API_SPEC.md` §Courses are consumed.

## Public API (via `index.ts`)
- `coursesRoutes` — consumed by `app/routes/router.tsx`
- `useCourse`, `useCourses` — for other features that need to read course data (e.g. `enrollment` will want `useCourse(courseId)` to show what a student is enrolling in)
- Types: `Course`, `CourseListFilters`, `CourseModule`, `Lesson`

`useCreateCourse`/`useUpdateCourse`/`useDeleteCourse`/`useAddModule`/`useAddLesson` are intentionally **not** exported — they're authoring-only and specific to this feature's own instructor pages.

## Design Decisions
- **Public catalog defaults to `status: 'PUBLISHED'`** and isn't user-togglable — there's no "my courses" endpoint in `API_SPEC.md` yet for an instructor to browse their own drafts, so that's deferred rather than half-built.
- **No category filter/picker** — `API_SPEC.md` has no `GET /categories` endpoint, so there's no way to populate a dropdown or validate a `categoryId` client-side. Category assignment is out of scope on the frontend until that endpoint exists.
- **Ownership-gated edit UI**: `CourseDetailPage` only shows an "Edit course" link when `useAuthStore().user.id === course.instructorId`; `InstructorCourseEditPage` redirects home if the loaded course isn't owned by the current user (defense in depth — the backend enforces this regardless).
- **`order` for modules/lessons**: omitted from the add-module/add-lesson forms entirely; the backend auto-assigns the next order when omitted (see backend `courses/context.md`), so the UI doesn't need manual ordering yet (drag-to-reorder would be a separate future task).

## Assumptions About Response Shapes
- `GET /courses` returns the paginated envelope (`data: Course[]`, `meta: {page, limit, total}`) — `coursesService.list` reads `response.data.meta` directly instead of the shared `unwrap()` helper, since `unwrap()` intentionally discards `meta`.
- `GET /courses/:id` embeds `modules[].lessons[]` in one response (per `API_SPEC.md`'s "Course detail with modules/lessons") — no separate lesson-fetching call is made.

## Shared-layer changes made while building this feature
- Extended `app/routes/ProtectedRoute.tsx` with an optional `role` prop (previously only checked `isAuthenticated`) — implements the "role-gated sub-trees ... check `user.role`" pattern `FE-ARCHITECTURE.md` §6 already describes but that hadn't been built yet. Used here for `/instructor/courses/*`.
- Added a named `PaginationMeta` type to `shared/types/api.types.ts` (previously inlined on `ApiSuccess.meta`) so `CoursePagination` (and future list features) can reference it instead of re-declaring the shape.

## Known Constraints / Deferred
- No drag-to-reorder for modules/lessons.
- No resource/attachment upload UI (`Resource` entity has no endpoint yet on the backend either).
- No tests yet for this feature — deferred per explicit instruction to finish Phase 1's feature set first.
