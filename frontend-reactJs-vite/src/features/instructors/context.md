# Instructors Feature (Frontend)

## Purpose
Public instructor storefront page (`/instructors/:id`): profile (avatar, name, bio) + aggregated stats + a grid of the instructor's published courses. Reachable from a course detail page's new "By <name>" byline.

## Endpoints Consumed
- `GET /instructors/:id` — profile + stats
- `GET /instructors/:id/courses?page=&limit=` — paginated published courses

## Public API (`index.ts` barrel)
- `instructorsRoutes` — registered in `app/routes/router.tsx`.
- `InstructorProfile`, `InstructorStats` types.

Hooks/components/service are intentionally not exported — nothing else consumes them yet.

## Design Decisions
- **Reuses `CourseCard`** (from `@/features/courses`, now exported via its barrel) for the course grid — no new card component.
- **`StatCard` promoted from `analytics/components/StatCard.tsx` to `shared/components/StatCard.tsx`** — this is the first cross-feature reuse of it, matching the precedent `Pagination` already set for promotion-on-second-use. `analytics`'s own pages were updated to import from the shared path.
- **No `Avatar` shared component exists** — the initials-fallback circle is a small local component (`InitialsAvatar`) inside `InstructorHeader.tsx`, matching `CourseCard`'s own inline "No image" fallback pattern rather than introducing a new shared component for a single use.
- **Star rating widget is a local, inlined copy** of `CourseHero`'s `HeroStars` (renamed `RatingStars`) rather than promoted to shared — only two use sites so far; promote if a third appears.
- **No `placeholderData`/`keepPreviousData`** on `useInstructorCourses` — `useCourses` (the closest existing paginated hook) doesn't use it either, so pagination here stays consistent with that (a brief loading flash between pages is acceptable, matching the catalog page's behavior).

## Known Constraints / Deferred
- No page-level test — matches this codebase's existing precedent of testing hooks/components and deferring page-level tests (see `courses/context.md`).
- No "no results because instructor doesn't exist yet" distinction from "instructor has zero courses" beyond the top-level profile-fetch error state — both a missing instructor and a real-but-courseless one show a normal empty grid if the profile fetch itself succeeds (it wouldn't for a missing instructor, since `getVerifiedInstructor` 404s first).
