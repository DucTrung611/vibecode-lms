# Courses Feature (Frontend)

## Purpose
Public course catalog/detail, a lesson viewer for enrolled students, plus instructor authoring (create course, edit course, add modules/lessons). Owns `/courses`, `/courses/:id`, `/courses/:courseId/lessons/:lessonId`, `/instructor/courses/new`, `/instructor/courses/:id/edit`.

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
| PATCH | `/lessons/:id` | `useUpdateLesson` |
| GET | `/categories` | `useCategories` |
| POST | `/categories` | `useCreateCategory` |

All 7 endpoints from `API_SPEC.md` §Courses are consumed, plus the backend's new (beyond-spec) category endpoints.

## Public API (via `index.ts`)
- `coursesRoutes` — consumed by `app/routes/router.tsx`
- `useCourse`, `useCourses` — for other features that need to read course data (e.g. `enrollment` will want `useCourse(courseId)` to show what a student is enrolling in)
- `CourseCard` — now exported for the `instructors` feature's storefront course grid to reuse.
- Types: `Course`, `CourseInstructorSummary`, `CourseListFilters`, `CourseModule`, `Lesson`

`useCategories`/`useCreateCategory` are **not** exported — only `CourseForm` (category picker + inline create) and `CourseFilters` (category filter) use them, both within this feature.

`useCreateCourse`/`useUpdateCourse`/`useDeleteCourse`/`useAddModule`/`useAddLesson` are intentionally **not** exported — they're authoring-only and specific to this feature's own instructor pages.

## Design Decisions
- **Public catalog defaults to `status: 'PUBLISHED'`** and isn't user-togglable — there's no "my courses" endpoint in `API_SPEC.md` yet for an instructor to browse their own drafts, so that's deferred rather than half-built.
- ~~No category filter/picker~~ **Closed**: `CourseForm` gets a category `<select>` (populated by `useCategories`) plus an inline "+ New category" toggle that swaps the select for a name input + "Add" button — creating one calls `useCreateCategory` and auto-selects the result. `CourseFilters` gets a plain category `<select>` (no create) alongside the existing level filter, wired into `CourseCatalogPage`'s query params.
- **`useCreateCategory` writes the new category into the `['categories']` query cache directly (`setQueryData`), not just `invalidateQueries`** — found via manual browser testing: an invalidate-only refetch lands one render tick too late for `CourseForm`'s "auto-select the category I just created" flow (`setValue('categoryId', newId)` fires before the refetched list contains the matching `<option>`, so the native `<select>` silently ignores the value — no error, just a UI-only bug where the picker reverted to "No category" despite the category having been created successfully). Writing the cache synchronously guarantees the option exists in the same render as the `setValue` call.
- **`useCategories` uses `staleTime: 5 * 60_000`** (5 minutes) — matches `FE-ARCHITECTURE.md` §7's own example of "rarely-changing data (categories)" verbatim.
- **Ownership-gated edit UI**: `CourseDetailPage` only shows an "Edit course" link when `useAuthStore().user.id === course.instructorId`; `InstructorCourseEditPage` redirects home if the loaded course isn't owned by the current user (defense in depth — the backend enforces this regardless).
- **`order` for modules/lessons**: omitted from the add-module/add-lesson forms entirely; the backend auto-assigns the next order when omitted (see backend `courses/context.md`), so the UI doesn't need manual ordering yet (drag-to-reorder would be a separate future task).
- **`EditLessonForm` is a separate component from `AddLessonForm`**, not a `mode: 'create' | 'edit'` prop the way `CourseForm` handles both cases — `AddLessonForm` resets and stays open after submit (built for rapid multi-add), while editing needs an in-place form that pre-fills from an existing lesson and closes itself on Save/Cancel; folding both interaction shapes into one component would mean threading extra conditionals through `AddLessonForm.spec.tsx`'s already-covered behavior for no real reuse win (the two components share field markup, not the surrounding UX). `ModuleEditorCard` owns a single `editingLessonId` piece of local state and swaps one lesson `<li>` for `<EditLessonForm>` when it matches — the rest of the list stays in its normal read view.
- **`LessonPage` resolves the caller's `enrollmentId` by scanning `useMyEnrollments()`** for an entry matching the route's `courseId`, rather than the backend exposing a "my enrollment for course X" lookup — `PATCH /enrollments/:id/progress` needs an `enrollmentId`, not a `courseId`, and no such single-lookup endpoint exists in `API_SPEC.md`. Same tradeoff `useMyEnrollments`'s own un-paginated "always page 1" limitation already accepts: fine until a student has enough enrollments that page 1 doesn't contain the one they're viewing.
- **`CourseModuleList` now links each lesson to `/courses/:courseId/lessons/:lessonId`**, plus a "Take quiz"/"View assignment" link when `Lesson.quizId`/`assignmentId` is set (from the backend's new discovery fields, see backend `courses/context.md`) — closes the gap `quizzes`'/`assignments`' own `context.md` files flagged: "no discovery path from a course/lesson to a quiz/assignment."
- **`ModuleEditorCard` (instructor's course-edit view) also links `assignmentId`**, to `/assignments/:id/submissions` — the instructor-side counterpart to `CourseModuleList`'s student-facing "View assignment" link, closing `assignments`' own "instructor has no way to discover this page" gap.
- **`LessonPage` has no video-progress tracking** (`watchedSeconds` is never sent) — only an explicit "Mark as complete" button calls `useUpdateProgress` with `status: 'COMPLETED'`. Wiring a video player's `onTimeUpdate` to debounced `watchedSeconds` updates would add real complexity (throttling, seek handling) for a field nothing else in the UI currently reads back; deferred rather than half-built.
- **`CourseForm`'s `thumbnailUrl` and `AddLessonForm`'s new `videoUrl` field both pair a `shared/components/FileUploadButton.tsx` with the existing URL text input** rather than replacing it — a click uploads via `POST /uploads` and calls `setValue(field, fileUrl)`, but pasting an already-hosted URL still works too. `AddLessonForm` also gained a `content` textarea for `TEXT` lessons — both fields already existed in `lessonFormSchema`/`useAddLesson`'s payload type but had no UI at all until now (not just "no upload," the whole field was missing from the quick-add form).
- **`AddLessonForm` now needs `defaultValues: { type: 'VIDEO' }` and `shouldUnregister: true`** on its `useForm` call — required once the `videoUrl`/`content` fields became conditionally rendered on `type`: without an explicit default, react-hook-form's `watch('type')` doesn't reflect the `<select>`'s own browser-default first option until the user interacts with it, so the video-URL field wouldn't appear on first render; without `shouldUnregister`, switching away from `VIDEO` would leave a stale empty `videoUrl` in the next submission's payload instead of dropping it.

## Assumptions About Response Shapes
- `GET /courses` returns the paginated envelope (`data: Course[]`, `meta: {page, limit, total}`) — `coursesService.list` reads `response.data.meta` directly instead of the shared `unwrap()` helper, since `unwrap()` intentionally discards `meta`.
- `GET /courses/:id` embeds `modules[].lessons[]` in one response (per `API_SPEC.md`'s "Course detail with modules/lessons") — no separate lesson-fetching call is made.
- `GET /courses/:id` now also optionally embeds `instructor: {id, fullName, avatarUrl}` (added for the `instructors` storefront feature) — `CourseHero` renders a "By <name>" byline linking to `/instructors/:id` when present. `GET /courses` (the catalog list) does **not** include this field; only the detail endpoint does.

## Shared-layer changes made while building this feature
- Extended `app/routes/ProtectedRoute.tsx` with an optional `role` prop (previously only checked `isAuthenticated`) — implements the "role-gated sub-trees ... check `user.role`" pattern `FE-ARCHITECTURE.md` §6 already describes but that hadn't been built yet. Used here for `/instructor/courses/*`.
- Added a named `PaginationMeta` type to `shared/types/api.types.ts` (previously inlined on `ApiSuccess.meta`) so `CoursePagination` (and future list features) can reference it instead of re-declaring the shape.
- **`CoursePagination` was promoted to `shared/components/Pagination.tsx` and deleted from this feature** once `enrollment`/`certificates`/`notifications`/`payments`/`reviews`/`assignments` all needed the identical Prev/Next-by-`PaginationMeta` control and `learning-paths` had already independently duplicated it inline (see those features' own `context.md` "Known Constraints" entries for the before-state). `CourseCatalogPage` now imports `Pagination` from `@/shared/components/Pagination` like every other consumer — no behavior change, pure de-duplication.

## Known Constraints / Deferred
- No drag-to-reorder for modules/lessons.
- No resource/attachment upload UI (`Resource` entity has no endpoint yet on the backend either) — the generic `POST /uploads` endpoint now exists (see `shared`'s `FileUploadButton`), but nothing here creates `Resource` rows, since there's still no `POST` endpoint for that entity.
- **No `LessonPage` tests** — following the same "hooks and components tested, pages deferred" split `certificates`' `context.md` documents for `CertificateVerifyPage`/`MyCertificatesPage`; its dependencies (`useCourse`, `useMyEnrollments`, `useUpdateProgress`) are each tested at the hook level already.
