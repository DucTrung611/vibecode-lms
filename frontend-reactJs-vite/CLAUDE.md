# Frontend: vibecode-lms

## Tech Stack
- Language: TypeScript
- Framework: React 19 + Vite
- React Compiler: enabled (babel plugin in `vite.config.ts`) — avoid manual `useMemo`/`useCallback`, let the compiler handle memoization
- Router / state / UI library: none installed yet

## Documentation

### Must Read
- @docs/FE-PROJECT-RULES.md - Conventions, patterns, MUST/MUST NOT (not created yet — ask before assuming rules)
- @docs/FE-ARCHITECTURE.md - Folder structure, layers, feature anatomy (not created yet — ask before assuming rules)

### Reference
- @../share-docs/API_SPEC.md - API contract (endpoints, auth flow, response envelope, error codes to consume)
- @../share-docs/DATABASE.md - Schema (entity shapes returned by the API)

## Quick Reference

### Feature Location
`src/features/[name]/` - not yet scaffolded; repo is still the bare `npm create vite` starter (`src/App.tsx`, `src/main.tsx` only)

### Response Handling
API responses follow `{ success, data, meta? }` / `{ success: false, error: { code, message, details } }` (API_SPEC.md §4) — unwrap this envelope in one shared place (e.g. an API client/interceptor), don't repeat it per call site

### Error Code Prefix
`[FEATURE]_[NUMBER]` - e.g., AUTH_001, COURSE_004 (API_SPEC.md §5)
