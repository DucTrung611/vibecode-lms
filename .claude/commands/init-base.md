---
description: Scaffold Phase 0 base architecture for backend or frontend (folders, config, wiring) — no feature code
argument-hint: [backend|frontend]
---

Scaffold the Phase 0 foundation for $ARGUMENTS. Do NOT generate any feature code (no `features/*`) — this command only sets up the shared skeleton every feature will build on.

Read first (don't skip):
- If $ARGUMENTS is `backend`: `backend-nest-js/docs/BE-ARCHITECTURE.md`, `backend-nest-js/docs/BE-PROJECT-RULES.md`, `share-docs/DATABASE.md`
- If $ARGUMENTS is `frontend`: `frontend-reactJs-vite/docs/FE-ARCHITECTURE.md`, `frontend-reactJs-vite/docs/FE-PROJECT-RULES.md`, `share-docs/API_SPEC.md`

## Backend scope
1. `src/config/configuration.ts` — typed config sections (database, jwt, ai, storage), validated via Joi in `@nestjs/config`; app must fail fast on startup if required env vars are missing.
2. `src/core/database/prisma.service.ts` — single `PrismaService`, injected via DI, never instantiated with `new PrismaClient()` elsewhere.
3. `src/shared/` — `guards/` (`JwtAuthGuard`, `RolesGuard`), `filters/` (`HttpExceptionFilter`), `interceptors/` (`ResponseInterceptor` producing the `{success,data,meta}` / `{success:false,error}` envelope from API_SPEC.md §4), `decorators/` (`@CurrentUser()`), `utils/`, `types/`.
4. Wire the middleware chain once in `main.ts`: `helmet()` → global `ValidationPipe` → `HttpExceptionFilter` → `ResponseInterceptor`.
5. `.env.example` with the vars `configuration.ts` expects (never commit a real `.env`).
6. `prisma/schema.prisma` generated from `share-docs/DATABASE.md` (models, `@map`/`@@map` for snake_case columns, cuid PKs) + run the first `prisma migrate dev`.
7. Leave `src/features/` empty — feature folders are created by `/be-feature`.

## Frontend scope
1. `src/app/` — `main.tsx`, `App.tsx` (layout shell), `routes/router.tsx` (empty route list for now), `routes/ProtectedRoute.tsx`, `providers/QueryProvider.tsx`, `providers/AuthProvider.tsx`.
2. `src/shared/services/api.ts` — Axios instance: base URL from env, `Authorization: Bearer` interceptor reading `auth.store`, on `401 AUTH_002` (API_SPEC.md) triggers the refresh-token flow before retrying.
3. `src/shared/stores/auth.store.ts`, `src/shared/stores/ui.store.ts` (Zustand).
4. `src/shared/components/` — `Button`, `Modal`, `Skeleton` (minimal but functional; don't over-design).
5. Wire Tailwind: `@tailwindcss/vite` plugin in `vite.config.ts`, `@import "tailwindcss";` in `src/styles/globals.css`, imported once in `main.tsx`.
6. Leave `src/features/` empty — feature folders are created by `/fe-feature`.

## After scaffolding
Report what was created and what's still a stub (e.g. auth flow not wired to a real backend endpoint yet). Don't invent endpoints that aren't in `API_SPEC.md`.
