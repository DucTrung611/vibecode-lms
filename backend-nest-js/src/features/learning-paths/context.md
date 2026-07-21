# Learning Paths Feature

## Purpose
Browsing curated/AI-generated sequences of courses ("learning paths") and enrolling in one.

## Owned Entities
- `LearningPath` (`learning_paths` table)
- `LearningPathItem` (`learning_path_items` table)
- `LearningPathEnrollment` (`learning_path_enrollments` table)

## Endpoints Implemented (API_SPEC.md §6 Learning Paths)
| Method | Path | Status |
|---|---|---|
| GET | `/learning-paths` | ✅ |
| POST | `/learning-paths/generate` | ❌ deferred |
| POST | `/learning-paths/:id/enroll` | ✅ |

`POST /learning-paths/generate` (AI-generate personalized path) is **not implemented**, for the exact reason `quizzes`' `context.md` already gives for deferring `POST /lessons/:id/quizzes/generate`: there is no AI provider client anywhere in the codebase (only unused placeholder `AI_PROVIDER_API_KEY`/`AI_PROVIDER_BASE_URL` config). Building it now would mean inventing a provider integration with no precedent. Revisit once `ai-chatbot` (or a shared AI client) exists.

This leaves no endpoint that creates a `LearningPath` — same gap `quizzes` has for `Quiz`/`Question` (no manual authoring endpoint either). `LearningPath` rows must be seeded/created out-of-band (e.g. directly via Prisma) until either the generate route or a manual authoring endpoint is built.

## Public API (for other features to inject)
- `LearningPathsService` — exported via `LearningPathsModule.exports`. No other feature consumes it yet.

This feature has no cross-feature dependencies — it reads `Course` only through its own repository's Prisma `include` (same pattern `certificates`/`reviews`/`payments` already use for their own `course: true` includes), not by importing `CoursesService` or `CourseRepository`.

## Design Decisions
- **No `GET /learning-paths/:id` detail endpoint** — `API_SPEC.md` §6 only lists `GET /learning-paths` (list). Since there's nowhere else for a student to see what courses a path contains before enrolling, `LearningPathRepository.findMany` includes each path's `items` (with their `course` summary, ordered by `LearningPathItem.order`) directly in the list response — unlike `courses`, which keeps its list bare and pushes detail into a separate `findByIdWithDetail` call.
- **Enroll response is the full `LearningPathEnrollmentEntity`**, not a narrowed `{ id, status }` shape — `LearningPathEnrollment` has no `status` field (only `progressPercent`/`startedAt`/`completedAt`), so there was no equivalent of `enrollment`'s special-cased `{ enrollmentId, status }` response to mirror; returning the entity as-is matches how `reviews`' `POST /courses/:id/reviews` returns its created entity.
- **`LearningPath` has no `createdAt`/`updatedAt`** — matches `DATABASE.md`'s table definition for this entity exactly (no timestamp columns listed, unlike every other table), already reflected in the applied Prisma migration; not an oversight in this feature's entity mapping.
- **No progress-tracking endpoint**: `LearningPathEnrollment.progressPercent` is stored and returned but nothing updates it (no equivalent of `enrollment`'s `PATCH /enrollments/:id/progress`) — not specified in `API_SPEC.md` for this feature.

## Error Codes
Adds two new codes, following the `LEARNING_PATH_[NUMBER]` format (the two-word feature name spelled with an underscore, same separator convention every other prefix already uses between the feature name and the number):

| Code | HTTP | Meaning |
|---|---|---|
| `LEARNING_PATH_001` | 404 | Learning path not found |
| `LEARNING_PATH_002` | 409 | Already enrolled in this learning path |

`share-docs/API_SPEC.md` §5 should be updated to include both the next time it's revised.

## Known Constraints / Deferred
- No AI-generation (`POST /learning-paths/generate`) — see above.
- No way to create a `LearningPath` manually either — not specified in `API_SPEC.md`.
- No "my learning paths" endpoint (equivalent of `/enrollments/me` or `/orders/me`) — not specified in `API_SPEC.md`; a student can enroll but has no dedicated listing of their enrolled paths yet.
