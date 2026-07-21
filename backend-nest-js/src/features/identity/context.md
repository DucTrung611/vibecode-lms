# Identity Feature

## Purpose
Owns authentication (registration, login, JWT access/refresh token lifecycle) and the user profile resource. Every other feature depends on it, directly (via `UsersService`) or indirectly (via `JwtAuthGuard` + `RolesGuard`).

## Owned Entities
- `User` (`users` table)
- `RefreshToken` (`refresh_tokens` table)

## Endpoints Implemented (API_SPEC.md §6 Identity/Auth)
| Method | Path | Status |
|---|---|---|
| POST | `/auth/register` | ✅ |
| POST | `/auth/login` | ✅ |
| POST | `/auth/refresh` | ✅ |
| POST | `/auth/logout` | ✅ |
| GET | `/users/me` | ✅ |
| PATCH | `/users/me` | ✅ |

All six endpoints from the spec are implemented — nothing skipped.

## Public API (for other features to inject)
- `AuthService` — exported per module convention; not expected to be called by other features directly today.
- `UsersService`
  - `getProfile(userId): Promise<UserEntity>` — throws `AUTH_007` (404) if not found.
  - `findById(userId): Promise<UserEntity>` — alias of `getProfile`, intended for other features (e.g. `courses` resolving an `instructorId`) that need a safe (no-password) user projection without importing `UserRepository` directly.
  - `updateProfile(userId, dto): Promise<UserEntity>`

Other features must inject `UsersService` from `IdentityModule.exports` — never `UserRepository` or `PrismaService.user` directly.

## Auth Mechanics
- Access token: JWT signed with `JWT_ACCESS_SECRET`, 15 min default TTL (`JWT_ACCESS_EXPIRES_IN`), payload `{ sub, email, role }`. Validated by `JwtStrategy` (`strategies/jwt.strategy.ts`), consumed globally via `shared/guards/jwt-auth.guard.ts`.
- Refresh token: JWT signed with a **separate** `JWT_REFRESH_SECRET`, 7 day default TTL, payload `{ sub }`. Never stored raw — persisted as a SHA-256 digest (`utils/refresh-token.util.ts`) in `refresh_tokens.token_hash`, so a lookup can go straight to a DB query instead of iterating rows with `bcrypt.compare` (bcrypt's per-guess cost is for low-entropy secrets like passwords; a signed JWT is already high-entropy).
- Rotation: every `/auth/refresh` call revokes the presented refresh token row (`revoked_at`) and issues a brand-new pair — reuse of a revoked/expired token fails closed.
- `/auth/logout` revokes the specific refresh token in the request body; it's idempotent (unknown/foreign/already-revoked tokens are silently ignored) since a client's own logout button shouldn't be able to error out.

## Error Codes
The four codes already in `API_SPEC.md` §5 are honored exactly (`AUTH_001` missing/invalid token, `AUTH_002` expired token — now also reused for expired refresh tokens, `AUTH_003` insufficient role, produced automatically by `RolesGuard` returning `false` → Nest's default 403). This feature additionally defines, following the same `AUTH_[NUMBER]` format (not present in the original table, needed for register/login/refresh use cases the table didn't enumerate):

| Code | HTTP | Meaning |
|---|---|---|
| `AUTH_004` | 409 | Email already registered |
| `AUTH_005` | 401 | Invalid email or password |
| `AUTH_006` | 401 | Invalid or revoked refresh token |
| `AUTH_007` | 404 | User not found |

`share-docs/API_SPEC.md` §5 should be updated to include these the next time it's revised.

## Known Constraints / Deferred
- `shared/guards/jwt-auth.guard.ts` was extended (not just consumed) to add a `handleRequest` override that distinguishes `TokenExpiredError` (→`AUTH_002`) from any other failure (→`AUTH_001`), matching API_SPEC.md §2 exactly. This is shared infrastructure, not identity-owned, but the distinction only made sense once a real `JwtStrategy` existed.
- Public registration only allows `STUDENT` or `INSTRUCTOR` roles; `ADMIN` accounts must be provisioned out-of-band (seed script / manual DB insert) — no endpoint for it in this phase.
- No password-reset / email-verification flow yet — not in `API_SPEC.md` for this phase.
- `UserStatus` (`ACTIVE`/`INACTIVE`/`BANNED`) is not yet enforced at login — deferred until a feature actually needs it, to avoid inventing behavior the spec doesn't describe.
