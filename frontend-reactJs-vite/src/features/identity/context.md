# Identity Feature (Frontend)

## Purpose
Login, registration, and profile management UI against the backend `identity` feature (`API_SPEC.md` §Identity/Auth). Owns the `/login`, `/register`, and `/profile` routes.

## Endpoints Consumed
| Method | Path | Used by |
|---|---|---|
| POST | `/auth/register` | `useRegister` |
| POST | `/auth/login` | `useLogin` |
| POST | `/auth/logout` | `useLogout` |
| GET | `/users/me` | `useCurrentUser` |
| PATCH | `/users/me` | `useUpdateProfile` |

`POST /auth/refresh` is **not** called from this feature — it's already handled transparently by the shared `api.ts` response interceptor on a `401 AUTH_002`.

## Public API (via `index.ts`)
- `identityRoutes` — `RouteObject[]` consumed by `app/routes/router.tsx`
- `useLogin`, `useRegister`, `useLogout`, `useCurrentUser`, `useUpdateProfile`
- Types: `LoginPayload`, `RegisterPayload`, `UpdateProfilePayload`

Other features needing "is logged in" / "current user" should read `useAuthStore()` (shared, per `FE-ARCHITECTURE.md` §7) rather than importing this feature's hooks — this feature's hooks are for the identity pages themselves and for keeping the store in sync.

## Assumptions About Response Shapes
- `POST /auth/login` → `data: { accessToken, refreshToken, user }` (matches `AuthService.login` on the backend, which spreads `TokenPair` alongside `user`).
- `POST /auth/register` → `data: <User profile, no tokens>` — register does **not** auto-login; the form redirects to `/login` on success. If product wants auto-login instead, swap `useRegister`'s `onSuccess` to call `setSession` once the backend response includes a token pair.
- `POST /auth/logout` → `204 No Content` — response body ignored.

## State Sync
`useAuthStore` (shared) is the single source of truth for the current user (avoids two competing caches). `useCurrentUser` and `useUpdateProfile` both write into the store (`setUser`) in addition to updating the React Query cache (`['identity', 'me']`), so components can read via either the store or the query without them drifting apart.

## Known Constraints / Deferred
- No "forgot password" flow — not in `API_SPEC.md` for this phase.
- Avatar upload is a raw URL field for now; a real file-upload widget depends on the `multipart/form-data` convention (`API_SPEC.md` §3) and isn't wired here.
- Added `@hookform/resolvers` as a new dependency — the pairing (`react-hook-form` + `zod`) was already decided in `FE-PROJECT-RULES.md` §5, but the resolver glue package wasn't installed yet.
- Extended shared `auth.store.ts` with a `setUser` setter (previously only `setSession`/`setAccessToken`/`clearSession` existed) so profile fetch/update can refresh the cached user without re-authenticating.
- The repo had no test runner yet (Phase 0 scaffold gap). Added Vitest + Testing Library (`vite.config.ts` `test` block, `src/test/setup.ts`, `src/test/test-utils.tsx`, `npm test` / `npm run test:watch`) to make `FE-PROJECT-RULES.md` §8 actually runnable — this is shared infra, not identity-specific, and later features should reuse it rather than re-adding a test runner.
