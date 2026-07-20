# Backend: vibecode-lms

## Tech Stack
- Language: TypeScript
- Framework: NestJS v11
- ORM: Prisma (installed; `prisma/schema.prisma` not created yet — see DATABASE.md)
- Database: MySQL 8+

## Documentation

### Must Read
- @docs/BE-PROJECT-RULES.md - Conventions, patterns, MUST/MUST NOT
- @docs/BE-ARCHITECTURE.md - Folder structure, layers, feature anatomy

### Reference
- @../share-docs/API_SPEC.md - API contract
- @../share-docs/DATABASE.md - Schema

## Quick Reference

### Feature Location
`src/features/[name]/` - not yet scaffolded; repo is still the bare `nest new` starter (`src/app.*` only)

### Feature Boundary
A feature's service must never import another feature's internals directly — cross-feature access only via the target feature's exported service or domain events (BE-PROJECT-RULES.md §3, BE-ARCHITECTURE.md §5)

### Error Code Prefix
`[FEATURE]_[NUMBER]` - e.g., AUTH_001, COURSE_004
