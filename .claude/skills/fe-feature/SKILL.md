---
name: fe-feature
description: Generate a complete frontend feature folder (components, hooks, services, store, barrel) per FE-ARCHITECTURE.md/FE-PROJECT-RULES.md
argument-hint: [feature-name]
---

Generate the frontend feature `$ARGUMENTS` end-to-end, following the exact anatomy and rules already established for this repo — don't improvise a different structure.

## Before writing code
1. Read `frontend-reactJs-vite/docs/FE-ARCHITECTURE.md` §3 (Feature Anatomy), §4 (Data Flow), §8 (API Layer).
2. Read `frontend-reactJs-vite/docs/FE-PROJECT-RULES.md` in full — naming, component rules, anti-patterns table.
3. Read `share-docs/API_SPEC.md` for this feature's endpoints, request/response shapes, and error codes to handle.
4. If this feature needs another feature's UI/logic, only import from that feature's `index.ts` barrel — never reach into its internal files.

## What to generate
`src/features/<feature>/`
- `components/` — one component per file, PascalCase, ≤~150 lines each, Tailwind classes inline
- `hooks/use<Feature>.ts` — React Query wrapper(s) around the service calls
- `services/<feature>.service.ts` — Axios calls only, typed request/response
- `stores/<feature>.store.ts` — Zustand slice, only if the feature needs client state beyond `useState`
- `types/<feature>.types.ts`
- `pages/` — routed page(s) composing the above, registered in `app/routes/router.tsx` (lazy-loaded)
- `index.ts` — the only public barrel; everything cross-feature imports through this
- `context.md` — feature purpose, exported public API, known constraints

## Constraints (MUST NOT)
- No component calling `axios`/`fetch` directly — always through a hook wrapping a service.
- No `any`-typed state or props.
- No inline hex colors (`style={{color:'red'}}`) — Tailwind utility classes only.
- No prop-drilling `user` through multiple layers — read from `useAuthStore()`.
- Loading states use `shared/components/Skeleton`; API errors surface via `react-hot-toast` from React Query's `onError`.

## After generating
Wire the page route(s) into `app/routes/router.tsx`. Report which endpoints from `API_SPEC.md` are now consumed and any assumptions made about response shape.
