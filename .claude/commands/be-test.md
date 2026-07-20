---
description: Write backend unit/integration tests for an existing feature
argument-hint: [feature-name]
---

Write tests for the backend feature `$ARGUMENTS`. Assume the feature already exists at `src/features/<feature>/` — if it doesn't, stop and say so instead of generating tests for code that isn't there.

## Before writing
Read `backend-nest-js/docs/BE-PROJECT-RULES.md` §7 (Testing) and skim the feature's existing `.service.ts`/`.controller.ts`/`.repository.ts` and `context.md`.

## What to generate
- `tests/<feature>.service.spec.ts` — one `describe` per method, Arrange-Act-Assert, mock the repository layer (`Test.createTestingModule` or `jest.mock`)
- `tests/<feature>.controller.spec.ts` — mock the service layer, verify routing/DTO validation/response shaping
- Coverage target: ≥80% for service and repository layers (controllers may lean on e2e instead)

Run `npm run test -- <feature>` after writing and fix failures before reporting done.
