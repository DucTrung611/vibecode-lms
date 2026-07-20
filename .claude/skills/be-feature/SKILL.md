---
name: be-feature
description: Generate a complete backend feature module (controller, service, repository, dto, entities, tests) per BE-ARCHITECTURE.md/BE-PROJECT-RULES.md
argument-hint: [feature-name]
---

Generate the backend feature `$ARGUMENTS` end-to-end, following the exact anatomy and rules already established for this repo — don't improvise a different structure.

## Before writing code
1. Read `backend-nest-js/docs/BE-ARCHITECTURE.md` §3 (Feature Anatomy) and §4 (Request Flow).
2. Read `backend-nest-js/docs/BE-PROJECT-RULES.md` in full — naming, layering rules, anti-patterns table, response/error format.
3. Read `share-docs/DATABASE.md` for the entities this feature owns (fields, indexes, FKs).
4. Read `share-docs/API_SPEC.md` for this feature's endpoints, auth requirements, and error codes.
5. If other features are referenced (e.g. this feature needs `CourseService`), read that feature's `context.md` to find its exported public API — never import another feature's repository or internals directly.

## What to generate
`src/features/<feature>/`
- `<feature>.controller.ts` — routing + DTO validation only, no business logic
- `<feature>.service.ts` — business logic, may inject other features' *exported* services
- `<feature>.repository.ts` — the only file allowed to call `this.prisma.*`
- `dto/create-<feature>.dto.ts`, `dto/update-<feature>.dto.ts` — `class-validator` decorators
- `entities/<feature>.entity.ts`
- `types/<feature>.types.ts`
- `utils/` — only if there's non-trivial logic to extract (e.g. scoring)
- `<feature>.module.ts` — explicit `imports`/`providers`/`exports`; only the service is exported, never the repository
- `context.md` — feature purpose, owned entities, public API other features may call, known constraints

## Constraints (MUST NOT)
- No direct import of another feature's controller/service/repository file path — inject via its module's `exports` only.
- No `console.log` — inject Nest `Logger` per feature.
- No hardcoded config/secrets — read via `ConfigService`.
- No business logic in the controller or repository layers.
- Errors thrown as Nest exceptions in the service layer, mapped to the existing error-code table in `API_SPEC.md` §5 — don't invent new error codes without checking that table first.

## After generating
Register `<Feature>Module` in `AppModule`. Report which endpoints from `API_SPEC.md` are now implemented and which (if any) were intentionally skipped.
