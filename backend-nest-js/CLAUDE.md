# Backend: vibecode-lms

## Tech Stack
- Language: TypeScript
- Framework: NestJS v11
- ORM: Prisma (not yet installed — see DATABASE.md)
- Database: MySQL 8+

## Documentation

### Must Read
- @docs/BE-PROJECT-RULES.md - Conventions, patterns, MUST/MUST NOT (not created yet — ask before assuming rules)
- @docs/BE-ARCHITECTURE.md - Folder structure, layers, feature anatomy (not created yet — ask before assuming rules)

### Reference
- @../share-docs/API_SPEC.md - API contract
- @../share-docs/DATABASE.md - Schema

## Quick Reference

### Feature Location
`src/features/[name]/` - not yet scaffolded; repo is still the bare `nest new` starter (`src/app.*` only)

### Feature Boundary
A feature's service must never import another feature's service directly (DATABASE.md)

### Error Code Prefix
`[FEATURE]_[NUMBER]` - e.g., AUTH_001, COURSE_004
