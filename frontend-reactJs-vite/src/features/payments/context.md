# Payments Feature (Frontend)

## Purpose
Checkout for paid courses (create order → pay) plus order history. Composed into `enrollment`'s `EnrollButton` — this feature has **no purchase page/form of its own**; see Design Decisions.

## Endpoints Consumed
| Method | Path | Used by |
|---|---|---|
| POST | `/orders` | `useBuyCourse` |
| POST | `/orders/:id/pay` | `useBuyCourse` |
| GET | `/orders/me` | `useMyOrders` |

All three implemented in `backend-nest-js/src/features/payments`.

## Public API (via `index.ts`)
- `useBuyCourse` — the one cross-feature export; `enrollment`'s `EnrollButton` imports it from this barrel (never reaching into this feature's internal files, per `FE-PROJECT-RULES.md` §3) to run the buy flow for a course with `price > 0`, then chains into `enrollment`'s own `useEnroll` on success.
- `useMyOrders`, `paymentRoutes` (registers `/orders`)
- Types: `Order`, `OrderItem`

## Design Decisions
- **`EnrollButton` owns the purchase entry point, not this feature.** The backend's actual flow is three calls: `POST /orders` → `POST /orders/:id/pay` → `POST /courses/:id/enroll` — paying an order does not auto-enroll the student server-side (see `payments/context.md` on the backend). `useBuyCourse` composes the first two into one mutation; `EnrollButton` chains the third via `buyCourse.mutate(courseId, { onSuccess: () => enroll.mutate(courseId) })` rather than this feature reaching into `enrollment`'s internals — same cross-feature-via-barrel pattern `courses` already uses for `EnrollButton` and `CourseReviews`, just in the other direction (`enrollment` → `payments` here).
- **No cart / multi-course checkout UI**: `CreateOrderDto`/`POST /orders` accept `courseIds: string[]`, but the only entry point built is `EnrollButton`'s single-course "Buy" flow — there's no course catalog "add to cart" affordance in `API_SPEC.md` or elsewhere in this codebase yet. `paymentService.createOrder` still takes an array to match the backend contract exactly, so a cart UI could be added later without a service-layer change.
- **No client-side "already purchased" check before showing the price button**: same low-frequency-edge-case tradeoff `reviews`' `context.md` documents for its own form — the backend's `409 PAYMENT_003`/`402 PAYMENT_001` surface as toasts if a student who already owns the course somehow retries.
- ~~Order history has no pagination controls~~ **Closed**: `OrdersPage` now lifts `page` state and renders `shared/components/Pagination.tsx`.

## Known Constraints / Deferred
- No "buy now" progress indicator distinguishing "creating order" from "paying" — `useBuyCourse.isPending` covers both steps as one opaque "Processing…" state on the button.
- No order detail/receipt page — only the list view (`/orders`).
- No retry-payment UI for a `PENDING` order left over from a failed/abandoned purchase — the only way to pay is via a fresh `EnrollButton` click, which creates a new order rather than resuming the old one (matches the backend's lack of a "resume this order" concept, see backend `payments/context.md`'s no-duplicate-order-guard note).
