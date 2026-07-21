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
| POST | `/learning-paths/generate` | ✅ |
| POST | `/learning-paths/:id/enroll` | ✅ |

`POST /learning-paths/generate` (AI-generate personalized path) is now implemented using the shared `AiClientService` (`core/ai/`) — the same client `quizzes`' generate route and `ai-chatbot`'s replies use. Requires `AI_PROVIDER_API_KEY`/`AI_PROVIDER_BASE_URL` to be configured; like `quizzes`, there's no non-AI fallback (nothing else can "generate" a path), so an unconfigured provider surfaces `AI_001` (503) rather than degrading silently.

This is still the *only* endpoint that creates a `LearningPath` — there's no manual authoring endpoint (same gap `quizzes` has for `Quiz`/`Question`). Before this endpoint existed, `LearningPath` rows had to be seeded out-of-band; now a student can create one themselves, but an instructor/admin still cannot curate one by hand.

## Public API (for other features to inject)
- `LearningPathsService` — exported via `LearningPathsModule.exports`. No other feature consumes it yet.

This feature now injects `CoursesService` (from `CoursesModule`, newly imported) to fetch the candidate-course catalog for generation, and `AiClientService` (from the global `CoreModule`) for the completion call — never `CourseRepository` directly. It still reads `Course` summaries for the *list* endpoint only through its own repository's Prisma `include` (same pattern `certificates`/`reviews`/`payments` use), not through `CoursesService`.

## Design Decisions
- **No `GET /learning-paths/:id` detail endpoint** — `API_SPEC.md` §6 only lists `GET /learning-paths` (list). Since there's nowhere else for a student to see what courses a path contains before enrolling, `LearningPathRepository.findMany` includes each path's `items` (with their `course` summary, ordered by `LearningPathItem.order`) directly in the list response — unlike `courses`, which keeps its list bare and pushes detail into a separate `findByIdWithDetail` call.
- **Enroll response is the full `LearningPathEnrollmentEntity`**, not a narrowed `{ id, status }` shape — `LearningPathEnrollment` has no `status` field (only `progressPercent`/`startedAt`/`completedAt`), so there was no equivalent of `enrollment`'s special-cased `{ enrollmentId, status }` response to mirror; returning the entity as-is matches how `reviews`' `POST /courses/:id/reviews` returns its created entity.
- **`LearningPath` has no `createdAt`/`updatedAt`** — matches `DATABASE.md`'s table definition for this entity exactly (no timestamp columns listed, unlike every other table), already reflected in the applied Prisma migration; not an oversight in this feature's entity mapping.
- **No progress-tracking endpoint**: `LearningPathEnrollment.progressPercent` is stored and returned but nothing updates it (no equivalent of `enrollment`'s `PATCH /enrollments/:id/progress`) — not specified in `API_SPEC.md` for this feature.
- **Candidate courses capped at 100** (`MAX_CANDIDATE_COURSES` in the service): `generate` calls `CoursesService.findAll({ status: 'PUBLISHED', limit: 100 })` and sends only that page to the AI as the pool it can choose from — same "always page 1" simplification `useMyEnrollments`-style list consumers already accept elsewhere; a catalog with more than 100 published courses would silently exclude the rest from consideration.
- **`createdById` is set to the requesting student**, not left null — `LearningPath.createdById` is nullable and the column name suggests instructor authorship, but there's no other actor in this flow to attribute it to, and knowing who requested a given AI-generated path seems more useful than leaving it blank. A judgment call, not specified in `DATABASE.md`.
- **Hallucination guard**: `utils/parse-generated-learning-path.util.ts` validates every `courseId` the AI returns against the exact candidate-id set sent in the prompt — an id the model invents (or copies wrong) is rejected as `LEARNING_PATH_003` (502) rather than being persisted and causing a foreign-key failure (or worse, silently referencing the wrong course) deeper in `LearningPathRepository.createGenerated`.
- **AI-generate is unverified against a live provider** — same caveat `quizzes`' `context.md` documents: built and unit-tested against a mocked `AiClientService`, no real `AI_PROVIDER_API_KEY`/`AI_PROVIDER_BASE_URL` credentials were available to exercise it against an actual model end-to-end.

## Error Codes
Adds four new codes, following the `LEARNING_PATH_[NUMBER]` format (the two-word feature name spelled with an underscore, same separator convention every other prefix already uses between the feature name and the number):

| Code | HTTP | Meaning |
|---|---|---|
| `LEARNING_PATH_001` | 404 | Learning path not found |
| `LEARNING_PATH_002` | 409 | Already enrolled in this learning path |
| `LEARNING_PATH_003` | 502 | AI provider returned an invalid learning path format (bad JSON, or a course id outside the candidate set) |
| `LEARNING_PATH_004` | 422 | No published courses exist to build a path from |

`AI_001` (503, provider not configured) and `AI_002` (502, provider request failed) come from `core/ai/ai-client.service.ts` and can also surface from `generate`.

`share-docs/API_SPEC.md` §5 should be updated to include all four the next time it's revised.

## Known Constraints / Deferred
- No way to create a `LearningPath` manually (instructor/admin curation) — only the AI-generate route creates one; not specified in `API_SPEC.md`.
- No "my learning paths" endpoint (equivalent of `/enrollments/me` or `/orders/me`) — not specified in `API_SPEC.md`; a student can enroll but has no dedicated listing of their enrolled paths yet.
