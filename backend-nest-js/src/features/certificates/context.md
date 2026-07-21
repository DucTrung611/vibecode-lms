# Certificates Feature

## Purpose
Event-driven certificate issuance: no HTTP endpoint creates a certificate. Instead this feature listens for `enrollment.completed` (emitted by `enrollment` when a student finishes every lesson in a course) and issues a `Certificate` automatically. Students list their own certificates; anyone can verify one by its public code.

## Owned Entities
- `Certificate` (`certificates` table)

## Endpoints Implemented (API_SPEC.md §6 Certificates)
| Method | Path | Status |
|---|---|---|
| GET | `/certificates/me` | ✅ |
| GET | `/certificates/:code/verify` | ✅ |

Both endpoints in `API_SPEC.md` for this feature are implemented. There is no `POST /certificates` in the spec — issuance is exclusively the event listener below, per `BE-ARCHITECTURE.md` §5's own worked example (`enrollment.completed` → `certificates` listens → generates the record).

## Public API (for other features to inject)
- `CertificatesService` — exported via `CertificatesModule.exports`, though nothing calls it directly yet; its only "public" surface in practice is the `enrollment.completed` event contract it consumes, not a method other features inject.

This feature does **not** import `CoursesModule` or `EnrollmentModule`. The event payload (`EnrollmentCompletedEvent`) already carries `studentId`/`courseId` — both already validated by `enrollment` before the event fires — so there's nothing left to check by re-injecting either service. This is intentionally the most decoupled feature in the codebase so far.

## Design Decisions
- **Event contract lives in `shared/events/enrollment-completed.event.ts`**, not inside `enrollment`'s or `certificates`' own folders — `BE-ARCHITECTURE.md` §5 lists events as one of the *allowed* cross-feature communication channels (alongside injecting a feature's exported service), distinct from "reaching into another feature's files." A shared, named contract (`ENROLLMENT_COMPLETED_EVENT` + `EnrollmentCompletedEvent`) is the event-based equivalent of a service's public API — both sides depend on the contract, neither depends on the other's internals.
- **`EventEmitterModule.forRoot()` registered once in `AppModule`** (global, per `@nestjs/event-emitter`'s own `forRoot()` behavior) — same pattern as `CoreModule`'s `@Global() PrismaService`: register once, inject anywhere, no per-feature module imports needed.
- **Idempotent by construction, not by catching a DB error**: the listener (`handleEnrollmentCompleted`) checks `findByStudentAndCourse` before creating, mirroring the existing "check unique, then create" pattern `enrollment`/`assignments` already use for their own unique constraints — not a `try/catch` around a Prisma `P2002` violation, which would've been the first use of Prisma-specific error handling in this codebase.
- **Listener never throws** — wrapped in `try/catch` with `logger.error`. `EventEmitter2.emit()` (the default, non-`await`-friendly emit used by `enrollment`) does not propagate listener errors back to the emitting code; letting an error escape here would become an unhandled promise rejection unrelated to whatever HTTP request happened to trigger course completion. Certificate issuance failing must never surface as a failure of the *progress update* request that triggered it.
- **`enrollment` gates re-emission**: `EnrollmentService.maybeCompleteEnrollment` now skips entirely once `enrollment.status === 'COMPLETED'` (previously it would re-run `markCompleted` on every subsequent progress update after already completing). Without this guard, every later progress update would re-emit `enrollment.completed`, and while this listener's own idempotency check would no-op each time, it's needless repeated work — fixed at the source instead of papered over here. See `enrollment`'s `context.md`.
- **`certificateUrl` is a placeholder path** (`/certificates/<code>.pdf`), not a real generated PDF — there is no document-generation/storage infrastructure anywhere in this codebase yet. Same deferred-infra pattern as `courses`' `thumbnailUrl`/file uploads.
- **`certificateCode`**: 16 hex chars from `crypto.randomBytes(8)`, retried against `findByCode` on collision — same collision-retry shape as `courses`' slug generation, just without a human-readable base since there's nothing meaningful to slugify here.
- **`GET /certificates/:code/verify` includes `course`/`student` summaries**, `GET /certificates/me` includes only `course`: a public verifier needs to confirm *whose* certificate it is and *for what course*; a student listing their own certificates already knows who they are.

## Error Codes
Adds one new code, following the `CERTIFICATE_[NUMBER]` format (not yet in `API_SPEC.md` §5):

| Code | HTTP | Meaning |
|---|---|---|
| `CERTIFICATE_001` | 404 | Certificate not found (bad/unknown `:code` on verify) |

`share-docs/API_SPEC.md` §5 should be updated to include `CERTIFICATE_001` the next time it's revised.

## Known Constraints / Deferred
- No manual/instructor-triggered issuance — only the automatic `enrollment.completed` path exists, matching `API_SPEC.md` (no `POST /certificates`).
- No real PDF/document generation or storage — see `certificateUrl` above.
- No `dto/create-certificate.dto.ts`/`update-certificate.dto.ts` — there is no HTTP endpoint that creates or updates a certificate, so the usual anatomy's DTO pair doesn't apply; only `dto/query-certificates.dto.ts` exists (page/limit for `GET /certificates/me`), same deviation `enrollment` documented for its missing `create-enrollment.dto.ts`.
