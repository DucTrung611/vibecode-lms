# Courses Feature

## Purpose
Course catalog and authoring: courses, modules, lessons, and categories.

## Owned Entities
- `Course` (`courses` table)
- `Module` (`modules` table)
- `Lesson` (`lessons` table)
- `Category` (`categories` table) — now has list/create endpoints (see below), in addition to the existence check `courses`/`assertCategoryExists` already used.

`Resource` (`resources` table) is in `DATABASE.md` but has no endpoint in `API_SPEC.md` for this phase — not implemented.

## Endpoints Implemented (API_SPEC.md §6 Courses)
| Method | Path | Status |
|---|---|---|
| GET | `/courses` | ✅ |
| GET | `/courses/:id` | ✅ |
| POST | `/courses` | ✅ |
| PATCH | `/courses/:id` | ✅ |
| DELETE | `/courses/:id` | ✅ |
| POST | `/courses/:id/modules` | ✅ |
| POST | `/modules/:id/lessons` | ✅ |
| PATCH | `/lessons/:id` | ✅ |
| GET | `/categories` | ✅ |
| POST | `/categories` | ✅ |

All 7 spec'd endpoints implemented, plus `GET`/`POST /categories` added beyond `API_SPEC.md` to close the "categoryId is only existence-checked against a table seeded some other way" gap — an instructor can now actually create a category to assign to a course, instead of needing one seeded out-of-band.

## Public API (for other features to inject)
- `CoursesService` — exported via `CoursesModule.exports`. Relevant methods for other features (e.g. `enrollment` verifying a course exists/is published): `findById(id): Promise<CourseEntity>` (throws `COURSE_004` if missing/soft-deleted).
- `findCourseIdByLessonId(lessonId): Promise<string>` (throws `COURSE_007` if the lesson doesn't exist) — added for `quizzes` to resolve a `Quiz.lessonId` up to its owning course so it can check enrollment via `EnrollmentService.isEnrolled`.
- `CategoriesService` — also exported via `CoursesModule.exports`, though no other feature consumes it yet.

Other features must inject `CoursesService`/`CategoriesService` — never `CourseRepository`/`ModuleRepository`/`LessonRepository`/`CategoryRepository` directly.

## Design Decisions
- **Slug**: auto-generated from `title` server-side (`utils/slug.util.ts`), not client-supplied — avoids the client needing to manage uniqueness. On collision, a random 6-hex-char suffix is appended and retried.
- **Status default**: new courses are created as `DRAFT` (matches `CourseStatus` enum default in `schema.prisma`); `PATCH /courses/:id` is how an instructor moves it to `PUBLISHED`/`ARCHIVED`.
- **`GET /courses` default scope**: returns all non-soft-deleted courses regardless of `status` unless the caller passes `?status=`, matching the query-filter pattern documented in `API_SPEC.md` §3 literally. There's no "my courses" endpoint in the spec for instructors to list their own drafts — out of scope for this phase.
- **Ownership check**: `PATCH/DELETE /courses/:id` and `POST /courses/:id/modules` verify `course.instructorId === currentUser.id` in the service layer (not the guard) — `RolesGuard` only confirms the caller *is* an instructor, not that they own *this* course.
- **`order` fields** (`Module.order`, `Lesson.order`): auto-assigned as the current sibling count when the DTO omits `order`, so callers can append without tracking indices themselves.
- **`PATCH /lessons/:id` deliberately omits `order`** — reordering lessons within a module is a separate, unrequested feature (see "Known Constraints"). `UpdateLessonDto` otherwise mirrors `CreateLessonDto` (all fields optional). Ownership is resolved by walking `lesson.moduleId → ModuleRepository.findById(moduleId).course.instructorId` — the same lookup `addLesson` already performs, just entered from the lesson side instead of the module side, so no new repository method was needed beyond the plain `LessonRepository.update`.
- **Price**: Prisma `Decimal` is converted to `number` in `CourseEntity` for a plain-JSON API response.
- **`LessonEntity.quizId`/`assignmentId`**: `GET /courses/:id`'s `detailInclude` now also pulls each lesson's linked `quizzes`/`assignments` (id only, via the `Lesson.quizzes`/`Lesson.assignments` relations already in `schema.prisma`), and `LessonEntity.fromPrisma` collapses each to a single nullable id (`lesson.quizzes?.[0]?.id ?? null`). This closes the "no discovery path from a course to its quizzes/assignments" gap both `quizzes`' and `assignments`' frontend `context.md` files flagged — the frontend can now render a "Take Quiz"/"View Assignment" link directly from a lesson without a separate lookup endpoint. Takes the *first* linked quiz/assignment only; `DATABASE.md` doesn't define a per-lesson cardinality limit, but `API_SPEC.md`'s UI-facing flows only ever need one link per lesson.
- **`POST /categories` requires `INSTRUCTOR`, not `ADMIN`** — `Category` isn't role-scoped in `DATABASE.md`/`API_SPEC.md` at all (neither the entity nor an endpoint were specified), and this app has no functional admin flow: `identity`'s `context.md` documents that public registration only allows `STUDENT`/`INSTRUCTOR` and `ADMIN` accounts "must be provisioned out-of-band" — meaning an `ADMIN`-gated endpoint would be uncreatable through the running app by anyone. `INSTRUCTOR` was chosen as the closest role that can actually reach this endpoint and has a real reason to (assigning a category while creating a course). A judgment call, not a spec requirement — revisit if `ADMIN` provisioning is ever built.
- **Category slug generation reuses `CoursesService`'s own pattern** (`utils/slug.util.ts`'s `slugify`/`withRandomSuffix`, retried against `CategoryRepository.findBySlug` until unique) — same approach, different table, no new utility invented.
- **`parentId` validated to exist, not validated against cycles** — `POST /categories` checks the referenced parent exists (`COURSE_005`, reusing the existing "category not found" code) but doesn't check whether creating this link would form a cycle (e.g. A → B → A). Cycle-checking would need either a recursive query or walking the parent chain in application code for a feature (nested categories) `DATABASE.md`/`API_SPEC.md` barely specify beyond the `parentId` column existing — deferred as speculative hardening until nested categories are actually used for something.

## Error Codes
Reuses `COURSE_004` (404, course not found) and `AUTH_003` (403, reused for ownership failures — RolesGuard already produces this same code for role failures, so "instructor but not the owner" and "not an instructor" surface identically to API consumers). Adds two new codes, following the same `COURSE_[NUMBER]` format (not yet in `API_SPEC.md` §5):

| Code | HTTP | Meaning |
|---|---|---|
| `COURSE_005` | 404 | Category not found (invalid `categoryId` on create/update) |
| `COURSE_006` | 404 | Module not found (`POST /modules/:id/lessons` with a bad `:id`) |
| `COURSE_007` | 404 | Lesson not found (`findCourseIdByLessonId` given a bad lesson id) |

`share-docs/API_SPEC.md` §5 should be updated to include these the next time it's revised.

## Known Constraints / Deferred
- No category *update*/*delete* endpoints — only list/create exist. Not specified anywhere; add if renaming/removing a category ever becomes a real need.
- No lesson *delete* endpoint and no lesson *reordering* — `PATCH /lessons/:id` only covers field edits (title/type/videoUrl/content/durationSec).
- No file upload for `thumbnailUrl`/`videoUrl`/lesson `Resource` — those are plain string URL fields for now; wiring real `multipart/form-data` uploads (`API_SPEC.md` §3) is deferred to whichever feature needs it first. (`POST /uploads` now exists as a generic endpoint — see `uploads/context.md` — and is wired into the *frontend* forms for these fields, but nothing here creates a `Resource` row.)
