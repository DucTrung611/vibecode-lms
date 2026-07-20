---
description: Create a Prisma migration for a schema change, following DATABASE.md conventions
argument-hint: <verb>_<description>, e.g. add_learning_paths
---

Create a Prisma migration for: $ARGUMENTS

## Before running
1. Read `share-docs/DATABASE.md` §4 (Conventions) and §5 (Migration Rules) — naming, cuid PKs, snake_case via `@map`, soft-delete only on `users`/`courses`, one migration per PR/feature.
2. Edit `backend-nest-js/prisma/schema.prisma` to reflect the change — keep `@map`/`@@map` consistent with existing models.
3. Run `npx prisma format` then `npx prisma validate` before migrating.

## Run
```
cd backend-nest-js
npx prisma migrate dev --name $ARGUMENTS
```

## Constraints
- Never edit an already-applied migration — if the schema needs to change again, create a new corrective migration.
- Prisma has no automatic down-migration — write a short manual rollback note (SQL or steps) in the migration folder if this is a production-risk change.
- After migrating, run `npx prisma generate` so `@prisma/client` types stay in sync.
