# Certificates Feature (Frontend)

## Purpose
Two read-only views against the backend's event-driven `certificates` feature: a student's own certificate list at `/my-certificates`, and a public verification page at `/certificates/verify/:code` (with a code-entry prompt at `/certificates/verify` for anyone who doesn't have a direct link).

## Endpoints Consumed
| Method | Path | Used by |
|---|---|---|
| GET | `/certificates/me` | `useMyCertificates` |
| GET | `/certificates/:code/verify` | `useVerifyCertificate` |

Both endpoints implemented in `backend-nest-js/src/features/certificates` are consumed. There is no `POST` to consume — the backend issues certificates automatically via a domain event when a student completes a course, so there is no create/generate UI here at all.

## Public API (via `index.ts`)
- `certificateRoutes` — consumed by `app/routes/router.tsx`
- `useMyCertificates`, `useVerifyCertificate`
- Types: `Certificate`

## Design Decisions
- **`/certificates/verify/:code` is a public route** (no `ProtectedRoute` wrapper) — matches the backend's `Auth: Public` on `GET /certificates/:code/verify`; anyone with a certificate code (e.g. an employer checking a candidate's claim) can verify it without an account.
- **`useVerifyCertificate` uses `retry: false`**, overriding the app-wide default (`retry: 1` in `QueryProvider`) — a 404 on a bad/mistyped code is a normal, expected outcome here, not a transient failure worth retrying.
- **`/certificates/verify` (no `:code`) shows `VerifyCodeForm`** instead of a bare error — someone arriving at the verification feature without a code (e.g. from a nav link) should be able to type one in, not hit a dead end. This is the one place in the frontend so far with a route that intentionally renders different content depending on whether a URL param is present, rather than treating "missing param" as an error state.
- **`CertificateCard`'s "View" link opens `certificateUrl` directly** (`target="_blank"`) — per the backend's own `context.md`, `certificateUrl` is currently a placeholder path (no real PDF exists yet), so this link doesn't resolve to real content today; wiring it as a real download is blocked on the backend building actual document generation/storage, not on anything in this feature.
- **No pagination controls on `/my-certificates`** — same deferred pattern `enrollment` already documented for `/my-courses`: `useMyCertificates` accepts `page`/`limit` and the backend paginates, but the page always requests page 1.

## Known Constraints / Deferred
- **No "certificate earned" notification/toast** — the backend issues certificates asynchronously (via `enrollment.completed`), so there's no request/response moment in this frontend where "you just earned a certificate" could be surfaced; that's naturally the `notifications` feature's job once it exists (`GET /notifications` would show it), not something `certificates` can synthesize on its own.
- **No real certificate document rendering** — see `certificateUrl` above.
- **No tests yet for `CertificateVerifyPage`/`MyCertificatesPage`** — following the same "hooks and components tested, pages deferred" split already used by `enrollment`/`quizzes`.
