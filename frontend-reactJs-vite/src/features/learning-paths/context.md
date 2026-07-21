# Learning Paths Feature (Frontend)

## Purpose
Browsing curated/AI-generated learning paths and enrolling in one. Standalone `/learning-paths` route — this feature isn't composed into any other feature's page (unlike `reviews`/`payments`), since `API_SPEC.md` doesn't link courses to the paths that contain them from the course detail side.

## Endpoints Consumed
| Method | Path | Used by |
|---|---|---|
| GET | `/learning-paths` | `useLearningPaths` |
| POST | `/learning-paths/:id/enroll` | `useEnrollLearningPath` |

Both implemented in `backend-nest-js/src/features/learning-paths`. `POST /learning-paths/generate` (AI-generate) has no frontend hook — the backend feature defers it entirely (see its `context.md`: no AI provider client exists yet).

## Public API (via `index.ts`)
- `learningPathRoutes` — registers `/learning-paths`, a **public** route (matches `API_SPEC.md`'s `Auth: Public` for `GET /learning-paths`), unlike `/my-courses` or `/orders` which require `ProtectedRoute`.
- `useLearningPaths`, `useEnrollLearningPath`
- Types: `LearningPath`, `LearningPathItem`, `LearningPathEnrollment`

## Design Decisions
- **`LearningPathEnrollButton` duplicates `enrollment`'s free-course `EnrollButton` logic** (sign-in prompt / role gate / pending / success states) almost verbatim, rather than importing and generalizing it. The backend entities aren't related (`LearningPathEnrollment` has no `price` concept — enrolling in a path is always free, paying happens per-course via `payments` when the student later enrolls in one of the path's courses), so there was no shared abstraction to extract without inventing one prematurely — same "self-contained feature" reasoning `FE-ARCHITECTURE.md` §9 already establishes for feature-specific components.
- **List response already includes each path's `items` (with course summaries)**, matching the backend's design decision to fold detail into the list since there's no `GET /learning-paths/:id`. `LearningPathCard` renders those items as plain pills (course titles only) — no thumbnails/pricing shown, since the list is meant to help a student pick a path, not shop for individual courses within it.
- **No discoverability link from `CourseCatalogPage` or anywhere else** — same gap `notifications`' `context.md` documents for `NotificationBell`: the app has no persistent header/nav shell yet, so `/learning-paths` is reachable only by direct URL until one exists.
- **Own pagination controls inlined in `LearningPathsPage`** rather than reusing `courses`' `CoursePagination` — that component isn't exported via `courses`' barrel (per `FE-PROJECT-RULES.md` §3, cross-feature access only through `index.ts`), so a from-scratch copy was cheaper than either reaching into `courses` internals or promoting pagination to `shared/` prematurely for a single extra consumer.

## Known Constraints / Deferred
- No AI-generation UI — mirrors the backend's deferred `POST /learning-paths/generate`.
- No "my learning paths" page — the backend has no `GET` equivalent of `/enrollments/me` for paths yet (see backend `context.md`).
- No progress display — `LearningPathEnrollment.progressPercent` is defined in the type but nothing in the UI surfaces it, since there's no endpoint that updates it.
