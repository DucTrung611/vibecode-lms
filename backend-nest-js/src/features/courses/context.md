# Courses Feature

## Purpose
Course catalog and authoring: courses, modules, lessons. Categories are read-only from this feature's perspective (no management endpoints exist in `API_SPEC.md` yet).

## Owned Entities
- `Course` (`courses` table)
- `Module` (`modules` table)
- `Lesson` (`lessons` table)
- `Category` (`categories` table) — read-only (existence check only, see below)

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

All 7 endpoints implemented — nothing skipped.

## Public API (for other features to inject)
- `CoursesService` — exported via `CoursesModule.exports`. Relevant methods for other features (e.g. `enrollment` verifying a course exists/is published): `findById(id): Promise<CourseEntity>` (throws `COURSE_004` if missing/soft-deleted).
- `findCourseIdByLessonId(lessonId): Promise<string>` (throws `COURSE_007` if the lesson doesn't exist) — added for `quizzes` to resolve a `Quiz.lessonId` up to its owning course so it can check enrollment via `EnrollmentService.isEnrolled`.

Other features must inject `CoursesService` — never `CourseRepository`/`ModuleRepository`/`LessonRepository` directly.

## Design Decisions
- **Slug**: auto-generated from `title` server-side (`utils/slug.util.ts`), not client-supplied — avoids the client needing to manage uniqueness. On collision, a random 6-hex-char suffix is appended and retried.
- **Status default**: new courses are created as `DRAFT` (matches `CourseStatus` enum default in `schema.prisma`); `PATCH /courses/:id` is how an instructor moves it to `PUBLISHED`/`ARCHIVED`.
- **`GET /courses` default scope**: returns all non-soft-deleted courses regardless of `status` unless the caller passes `?status=`, matching the query-filter pattern documented in `API_SPEC.md` §3 literally. There's no "my courses" endpoint in the spec for instructors to list their own drafts — out of scope for this phase.
- **Ownership check**: `PATCH/DELETE /courses/:id` and `POST /courses/:id/modules` verify `course.instructorId === currentUser.id` in the service layer (not the guard) — `RolesGuard` only confirms the caller *is* an instructor, not that they own *this* course.
- **`order` fields** (`Module.order`, `Lesson.order`): auto-assigned as the current sibling count when the DTO omits `order`, so callers can append without tracking indices themselves.
- **Price**: Prisma `Decimal` is converted to `number` in `CourseEntity` for a plain-JSON API response.

## Error Codes
Reuses `COURSE_004` (404, course not found) and `AUTH_003` (403, reused for ownership failures — RolesGuard already produces this same code for role failures, so "instructor but not the owner" and "not an instructor" surface identically to API consumers). Adds two new codes, following the same `COURSE_[NUMBER]` format (not yet in `API_SPEC.md` §5):

| Code | HTTP | Meaning |
|---|---|---|
| `COURSE_005` | 404 | Category not found (invalid `categoryId` on create/update) |
| `COURSE_006` | 404 | Module not found (`POST /modules/:id/lessons` with a bad `:id`) |
| `COURSE_007` | 404 | Lesson not found (`findCourseIdByLessonId` given a bad lesson id) |

`share-docs/API_SPEC.md` §5 should be updated to include these the next time it's revised.

## Known Constraints / Deferred
- No category management endpoints (create/list/update) — `categoryId` is only existence-checked against the `categories` table seeded some other way.
- No file upload for `thumbnailUrl`/`videoUrl`/lesson `Resource` — those are plain string URL fields for now; wiring real `multipart/form-data` uploads (`API_SPEC.md` §3) is deferred to whichever feature needs it first.
- No tests yet for this feature — deferred per explicit instruction to prioritize finishing Phase 1's feature set first.
