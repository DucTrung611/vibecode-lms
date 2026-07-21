# Reviews Feature (Frontend)

## Purpose
Course reviews, composed entirely into `courses`' `CourseDetailPage` — a public review list plus a posting form for students. This feature has **no page/route of its own**; see Design Decisions.

## Endpoints Consumed
| Method | Path | Used by |
|---|---|---|
| GET | `/courses/:id/reviews` | `useCourseReviews` |
| POST | `/courses/:id/reviews` | `useCreateReview` |

Both endpoints implemented in `backend-nest-js/src/features/reviews` are consumed.

## Public API (via `index.ts`)
- `CourseReviews` — the only cross-feature export; composed directly into `courses/pages/CourseDetailPage.tsx` (`courses` imports it from this barrel, never reaching into this feature's internal files, per `FE-PROJECT-RULES.md` §3) — the same pattern `enrollment`'s `EnrollButton` already established.
- `useCourseReviews`, `useCreateReview`
- Types: `Review`

## Design Decisions
- **No `pages/` folder, no route registered in `router.tsx`**: every endpoint here is scoped to a specific course (`/courses/:id/reviews`) and there's no "browse all reviews" or "my reviews" endpoint in `API_SPEC.md` — reviews only ever make sense rendered alongside the course they belong to. `FE-ARCHITECTURE.md`'s anatomy assumes a page exists, but `enrollment`'s `EnrollButton` already established the precedent that a feature's real UI can be a composed component with no page of its own; this feature takes that a step further and has *no* page at all, only the composed component.
- **`useCourseReviews` is not gated on `accessToken`**: `GET /courses/:id/reviews` is `Auth: Public` per `API_SPEC.md` — unlike `useMyEnrollments`/`useMyCertificates`, there's no reason to wait for login.
- **No client-side "is this student enrolled" pre-check before showing `ReviewForm`**: same reasoning `EnrollButton` already documented — the form renders for any authenticated `STUDENT`, and the backend's `403 AUTH_003` ("not enrolled") or `409 REVIEW_001` ("already reviewed") surface as toasts if a student who shouldn't be able to post tries anyway. A pre-check would mean fetching `/enrollments/me` on every course-detail view just to conditionally hide one form — the same low-frequency-edge-case tradeoff `enrollment`'s own `context.md` already made.
- **`StarRating` doubles as both display and input**: read-only when `onChange` is omitted (used in `ReviewCard`), interactive when provided (used in `ReviewForm` via `react-hook-form`'s `Controller`, since it's a custom component `register()` can't bind to directly) — one component instead of two near-duplicates.
- **After a successful submission, `ReviewForm` is replaced by nothing** (`CourseReviews` hides it once `createReview.isSuccess`) rather than resetting to let the student post again — matches the backend's one-review-per-student constraint; showing an empty form after a successful post would invite a guaranteed `409` on the next attempt.

## Known Constraints / Deferred
- ~~No pagination controls~~ **Closed**: `ReviewList` (not `CourseReviews` — it owns the query, so it owns the page state) now lifts `page` state and renders `shared/components/Pagination.tsx` beneath the review list.
- **No edit/delete UI** — matches the backend, which has no such endpoints.
- **No "already reviewed" indicator on reload**: if a student already reviewed a course, the form still renders on their next visit (no server-driven "you already reviewed this" state) — they only find out via the `409` toast if they try to submit again. Fixing this would need the same kind of "my submission for X" endpoint `assignments`' `context.md` already flagged as missing on the backend.
