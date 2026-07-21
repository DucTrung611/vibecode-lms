# Uploads Feature

## Purpose
A single generic file-upload endpoint (`POST /uploads`, `multipart/form-data`, field name `file`, per `API_SPEC.md` §1/§3) that every other feature's "URL field" (`Course.thumbnailUrl`, `Lesson.videoUrl`, `AssignmentSubmission.fileUrl`, `User.avatarUrl`, etc.) has been deferring to since each of those features' `context.md` independently noted "no file upload — plain string URL field for now." This closes that gap once, centrally, instead of each feature reinventing it.

## Owned Entities
None — this feature has no database table. It only writes to local disk and returns a URL string for the caller to store wherever they need it (a course's `thumbnailUrl`, a submission's `fileUrl`, etc.).

## Endpoints Implemented (API_SPEC.md §3 File upload convention)
| Method | Path | Status |
|---|---|---|
| POST | `/uploads` | ✅ |

Not itself named in `API_SPEC.md` §6's per-feature table (the spec describes the upload *convention* in §3, not a dedicated endpoint) — this is the concrete endpoint that convention was always going to need.

## Public API (for other features to inject)
Nothing — this is a leaf endpoint. A frontend calls `POST /uploads` first to get a `fileUrl`, then submits that URL as a normal string field to whichever feature's create/update endpoint (e.g. `PATCH /courses/:id` with `thumbnailUrl` set to the returned URL). No backend feature calls this one internally.

## Design Decisions
- **Local disk storage, using the `storage.localPath`/`storage.driver` config that already existed as an unused placeholder** (`STORAGE_DRIVER`/`STORAGE_LOCAL_PATH`/`STORAGE_S3_BUCKET` in `configuration.ts`, added in Phase 0 scaffolding but never consumed until now). Only the `local` driver is implemented — `s3` is validated as a config option but has no code path; there's no AWS SDK, no bucket credentials, and building one now would mean inventing a provider integration with no precedent, the same reasoning `quizzes`/`learning-paths` used to defer their AI-generate routes. `STORAGE_DRIVER=s3` is silently ignored (still writes to local disk) rather than throwing, since this is dev/demo infrastructure, not a security boundary — revisit if S3 actually needs to be supported.
- **Filenames are `randomUUID() + original extension`** — never the client-supplied original filename — to avoid path-traversal/collision issues from untrusted input.
- **`fileUrl` is built from the request's own protocol/host** (`req.protocol`/`req.get('host')`), not a configured "public app URL" — there was no such config value, and building the absolute URL from the incoming request works correctly in dev regardless of port and needs no new env var.
- **Files are served back via Express static middleware** (`app.useStaticAssets` in `main.ts`, mounted at `/uploads/`), not through a Nest controller — a plain static file server is simpler and faster than proxying file reads through a route handler for content that has no access control (matches `API_SPEC.md`: uploaded resource URLs are just public strings once created).
- **`helmet`'s `crossOriginResourcePolicy` is relaxed to `cross-origin`** in `main.ts` — helmet's default (`same-origin`) would block the Vite dev server (a different origin) from loading an uploaded image/video directly via `<img>`/`<video src>`. This is a narrow, documented relaxation, not a broader security rollback.
- **Single generic size limit (50MB)**, not the per-context limits `API_SPEC.md` §3 mentions ("50MB for videos, 10MB for submissions") — there's one endpoint, not one per feature, so it uses the higher of the two documented ceilings rather than trying to infer context from the request. A stricter per-feature limit would need either separate endpoints or a client-supplied "purpose" hint that isn't specified anywhere.
- **`JwtAuthGuard` only** — any authenticated user (any role) may upload; the endpoint doesn't know or care what the file is for, so there's nothing role-specific to gate on here. Whatever feature's create/update endpoint later accepts the resulting `fileUrl` enforces its own ownership/role rules as normal.

## Error Codes
Adds one new code:

| Code | HTTP | Meaning |
|---|---|---|
| `UPLOAD_001` | 400 | No file provided in the `file` field |

`share-docs/API_SPEC.md` §5 should be updated to include this the next time it's revised.

## Known Constraints / Deferred
- No S3/cloud storage driver — see Design Decisions.
- No file-type allowlist/validation (e.g. rejecting a `.exe` disguised as an image) — `API_SPEC.md` doesn't specify one; revisit if this ever accepts untrusted public uploads at scale rather than authenticated instructors/students.
- No virus scanning or content moderation — out of scope for this phase.
- No delete/cleanup endpoint — an uploaded file that's never referenced (e.g. the user abandoned a form) stays on disk indefinitely. Not specified anywhere; would need a garbage-collection strategy tied to whichever feature's record referenced it being deleted.
