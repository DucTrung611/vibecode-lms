# Instructors Feature

## Purpose
Public, unauthenticated instructor storefront: a profile (name, avatar, bio, aggregated stats) plus a paginated list of an instructor's published courses, so a course can link out to "who teaches this."

## Owned Entities
None — this feature adds no tables. It's a pure read layer over `users` (owned by `identity`) and `courses`/`enrollments`/`reviews` (owned by `courses`/`enrollment`/`reviews`).

## Endpoints Implemented (not yet in API_SPEC.md §6 — see Known Constraints)
| Method | Path | Auth |
|---|---|---|
| GET | `/instructors/:id` | Public |
| GET | `/instructors/:id/courses` | Public |

## Public API (for other features to inject)
- `InstructorsService` — exported via `InstructorsModule.exports`. Not consumed by any other feature yet (YAGNI).

This feature injects `UsersService` (from `IdentityModule`) and `CoursesService` (from `CoursesModule`) for verified lookups — never their repositories directly. `InstructorRepository` queries `Course`/`Enrollment`/`Review` directly via the shared `PrismaService` for stats only — same sanctioned pattern `analytics/context.md` already documents and justifies (not an import of another feature's repository class).

## Design Decisions
- **Two endpoints, not one combined response**: a single `GET /instructors/:id` embedding the full course list can't cleanly carry pagination `meta` for that embedded array (`API_SPEC.md` §4 scopes `meta` to list responses only). Matches the existing precedent of `GET /courses/:id` staying separate from `GET /courses/:id/reviews`.
- **`AUTH_007` reused for two cases**: "no such user" and "user exists but isn't an `INSTRUCTOR`" both 404 as `AUTH_007`. A public endpoint shouldn't reveal that an id belongs to a real, non-instructor account.
- **`totalStudents` is distinct students**, not summed enrollments — a student enrolled in two of the instructor's courses counts once. This intentionally diverges from `analytics.service.ts#getOverview`'s `totalStudents` (which sums per-course enrollment counts and double-counts). Confirmed as the desired "reach" metric for a public storefront.
- **`averageRating` is scoped to published courses only** — an archived/draft course's reviews don't count toward the public rating, consistent with the storefront only ever showing published courses. This also diverges from `analytics`'s overview, which includes all non-deleted courses regardless of status.
- **`ratingSummary` is a single `review.aggregate()` across all published course ids**, not a per-course loop + manual weighted-average reduce like `analytics.service.ts#getOverview`. Mathematically equivalent to the weighted-average formula when no per-course breakdown is needed — this storefront has no per-course table to render, unlike the analytics overview.
- **No caching** — recomputed live on every request, matching `analytics`'s stance. Revisit if this becomes a hot path.

## Error Codes
Reuses `AUTH_007` (404, "User not found" / repurposed message "Instructor not found") only. No new codes.

## Known Constraints / Deferred
- `share-docs/API_SPEC.md` §6/§7 should be updated with this feature's endpoints the next time it's revised.
- No search/sort/filter on `GET /instructors/:id/courses` beyond pagination — hard-scoped to `PUBLISHED`, sorted `createdAt desc`. Extend if an "instructor searches their own public catalog" need arises.
- No years-teaching/social-links/other profile fields beyond `bio` — scoped strictly to what the `User` model provides.
