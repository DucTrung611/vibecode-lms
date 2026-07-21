# Payments Feature

## Purpose
Order creation and checkout for paid courses: a student builds an order from one or more course IDs, triggers payment, and that paid order is what `enrollment`'s `POST /courses/:id/enroll` checks before allowing enrollment in a non-free course.

## Owned Entities
- `Order` (`orders` table)
- `OrderItem` (`order_items` table)

## Endpoints Implemented (API_SPEC.md §6 Payments)
| Method | Path | Status |
|---|---|---|
| POST | `/orders` | ✅ |
| GET | `/orders/me` | ✅ |
| POST | `/orders/:id/pay` | ✅ (mocked gateway, see Design Decisions) |

## Public API (for other features to inject)
- `PaymentsService` — exported via `PaymentsModule.exports`.
  - `hasPaidOrderForCourse(studentId, courseId)` is the one method built specifically for cross-feature use: `enrollment` injects `PaymentsService` (never `OrderRepository`) and calls it inside `EnrollmentService.enroll()` before allowing enrollment in a course with `price > 0`. This closes the gap `API_SPEC.md`'s `POST /courses/:id/enroll` documents (`402 PAYMENT_001` "if course is paid and no completed order exists") — previously `enrollment` threw `PAYMENT_001` unconditionally for any paid course since this feature didn't exist yet.

This feature injects `CoursesService` (from `CoursesModule`) — never `CourseRepository` directly — to look up live course prices when building an order.

## Design Decisions
- **No real payment gateway integration.** `POST /orders/:id/pay` immediately marks the order `PAID` and stamps `paidAt` — there is no Stripe/VNPay/etc. client anywhere in the codebase (same reasoning `quizzes`' `context.md` used to defer AI-generation: building a provider integration now would mean inventing one with no precedent, no API keys, no webhook handling). This is a **mock synchronous gateway**, not a stub that returns 501 — unlike the deferred AI-generate route, `pay` sits on the critical path to unblock paid-course enrollment, so a working (if fake) implementation is more useful than none. Revisit with a real provider (and webhook-driven `paid` status instead of a synchronous response) when one is chosen.
- **Order total is computed server-side from live `Course.price`**, never trusted from the client — `CreateOrderDto` only accepts `courseIds: string[]`, not prices. Prevents a client from ordering a course at an arbitrary price.
- **No duplicate-order guard**: a student can create multiple `PENDING` orders for the same course (e.g. retrying after abandoning checkout), and nothing here prevents a second `PAID` order for a course they already own. `hasPaidOrderForCourse` only checks "at least one paid order exists" for the enrollment gate — it doesn't stop redundant purchases. Not specified in `API_SPEC.md`/`DATABASE.md`; flagged as a known gap rather than guessing a new constraint.
- **`OrderEntity.totalAmount`/`OrderItemEntity.price` convert Prisma `Decimal` to `number`** via `Number(...)`, matching `CourseEntity.price`'s existing conversion.

## Error Codes
`PAYMENT_001` (402, "Payment required for this course") was already named in `API_SPEC.md` §6 and is thrown by `enrollment`, not this feature. Adds two new codes, following the `PAYMENT_[NUMBER]` format:

| Code | HTTP | Meaning |
|---|---|---|
| `PAYMENT_002` | 404 | Order not found |
| `PAYMENT_003` | 409 | Order is not payable (already `PAID`, `CANCELLED`, or `REFUNDED`) |

`AUTH_003` (403, "order belongs to another student") reuses the existing cross-feature convention rather than adding a payments-specific code.

`share-docs/API_SPEC.md` §5 should be updated to include `PAYMENT_002`/`PAYMENT_003` the next time it's revised.

## Known Constraints / Deferred
- No `CANCELLED`/`REFUNDED` transitions — `OrderStatus` defines all four states in the schema, but no endpoint sets `CANCELLED` or `REFUNDED`; only `PENDING → PAID` is reachable today. Cancellation/refund flows aren't specified in `API_SPEC.md`.
- No webhook/async confirmation path — see the mock-gateway note above.
- No admin/instructor view of orders — `API_SPEC.md` only specifies the student-facing `GET /orders/me`.
