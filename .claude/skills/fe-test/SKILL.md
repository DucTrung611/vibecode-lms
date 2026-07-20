---
name: fe-test
description: Write frontend tests for an existing feature (hooks, utils, key component interactions)
argument-hint: [feature-name]
---

Write tests for the frontend feature `$ARGUMENTS`. Assume the feature already exists at `src/features/<feature>/` — if it doesn't, stop and say so instead of generating tests for code that isn't there.

## Before writing
Read `frontend-reactJs-vite/docs/FE-PROJECT-RULES.md` §8 (Testing).

## What to generate, in priority order
1. `hooks/` — mock React Query, assert cache keys and error handling
2. `utils/` — pure function tests
3. Critical component interactions only (form submit, error/loading states) — skip trivial presentational components, no exhaustive snapshot testing

Run the test suite after writing and fix failures before reporting done.
