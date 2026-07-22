# Analytics Feature

## Purpose
Read-only instructor reporting: per-course stats (enrollment, completion rate, revenue, average rating, average quiz score) and an aggregated overview across all of an instructor's own courses.

## Owned Entities
None — this feature adds no tables. It's a pure aggregation layer over `enrollments`, `order_items`/`orders`, `reviews`, and `quiz_attempts` (owned by `enrollment`, `payments`, `reviews`, and `quizzes` respectively).

## Endpoints Implemented (API_SPEC.md §6 Instructor Analytics)
| Method | Path | Status |
|---|---|---|
| GET | `/instructor/analytics/overview` | ✅ |
| GET | `/instructor/courses/:id/analytics` | ✅ |

## Public API (for other features to inject)
- `AnalyticsService` — exported via `AnalyticsModule.exports`. Not consumed by any other feature yet (YAGNI).

This feature injects `CoursesService` (from `CoursesModule`) for the ownership check — never its repository directly.

## Design Decisions
- **`AnalyticsRepository` queries `Enrollment`/`OrderItem`/`Review`/`QuizAttempt` directly via the shared `PrismaService`**, rather than adding one-off count/aggregate methods to four unrelated feature services (`EnrollmentService`, `PaymentsService`, `ReviewsService`, `QuizzesService`) just to serve a report. This doesn't reach into another feature's repository *class* (the actual anti-pattern `BE-PROJECT-RULES.md` §5 forbids: `import { XRepository } from '../x/x.repository'`) — it uses the shared `core/database/PrismaService`, exactly like every other repository in the codebase. This is the first repository to use Prisma's `aggregate()` — no prior `groupBy`/`aggregate` precedent existed to follow, so keep any future additions to this pattern consistent with the methods here (one repository method per metric, returning a plain scalar, not the raw Prisma aggregate shape).
- **Ownership check is inline** (`CoursesService.findById(courseId).instructorId === instructorId`), same duplicated idiom `quizzes.service.ts#generateFromLesson` and `discussions` already use — no shared "assert ownership" method exists on `CoursesService`'s public surface, and this is now the third caller of the same three-line check.
- **`completionRate` is `0` when there are no enrollments** (not `null`/`NaN`) — avoids a division-by-zero surprising the frontend; a brand-new course with zero students is a valid, common state to render.
- **Overview's `averageRating` is a weighted average** across all owned courses (`Σ(avgRating × reviewCount) / Σ(reviewCount)`), not a plain mean of each course's average — a 5-review course and a 200-review course shouldn't count equally toward the instructor's overall rating.
- **No caching** — every call recomputes live from the DB. Acceptable for now given the small expected scale (few courses per instructor); revisit if this becomes a hot path.

## Error Codes
Reuses `COURSE_004` (404, course not found) and `AUTH_003` (403, not the owning instructor). No new codes.

## Known Constraints / Deferred
- No time-series/trend data (e.g. enrollments over the last 30 days) — only current-snapshot totals, to avoid introducing `groupBy`-by-date complexity in the first pass.
- No CSV/export endpoint.
- `getOverview` runs one set of aggregate queries per owned course (`Promise.all`, not a single batched query) — fine for the expected number of courses per instructor; would need a batched `groupBy` if that assumption stops holding.
