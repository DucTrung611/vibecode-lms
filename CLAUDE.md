# Project: vibecode-lms

## Overview
A learning management system (LMS). Covers course catalog & authoring, enrollment & progress tracking, quizzes, assignments, certificates, AI-generated learning paths, reviews, notifications, an AI chatbot (RAG over course content), and payments.

## Tech Stack
  - Frontend: React 19/Vite, TypeScript
  - Backend: NestJS v11, TypeScript
  - Database: MySQL 8+
  - ORM: Prisma (installed; `prisma/schema.prisma` not created yet)

## Structure
```
├── backend-nest-js/       → @backend-nest-js/CLAUDE.md
├── frontend-reactJs-vite/ → @frontend-reactJs-vite/CLAUDE.md
└── share-docs/            → Shared documentation
```

## Shared Docs
- @share-docs/API_SPEC.md
- @share-docs/DATABASE.md

## Available Skills

### Project Setup
- `/init-base [backend|frontend]` - Scaffold Phase 0 architecture (config, shared/, core or app/, wiring) — no feature code

### Feature Development
- `/be-feature [name]` - Generate a backend feature module (controller, service, repository, dto, entities, module, context.md)
- `/fe-feature [name]` - Generate a frontend feature folder (components, hooks, services, store, barrel, context.md)
- `/be-test [name]` - Write backend tests for an existing feature
- `/fe-test [name]` - Write frontend tests for an existing feature
- `/db-migrate <desc>` - Create a Prisma migration following DATABASE.md conventions

### Skill Routing
When user asks to:
- "tạo feature", "add module", "generate feature" → Use `/be-feature` or `/fe-feature`
- "viết test", "add tests" → Use `/be-test` or `/fe-test`
- "init project", "setup structure", "scaffold" → Use `/init-base`
- "đổi schema", "thêm bảng", "migration" → Use `/db-migrate`

### Important
- Always read the shared docs above BEFORE generating code
- Each app also has its own ARCHITECTURE.md and PROJECT-RULES.md under `<app>/docs/` (see each app's CLAUDE.md) — read those before writing feature code in that app
- Follow existing patterns in the codebase once feature code exists; don't invent conventions ahead of it
