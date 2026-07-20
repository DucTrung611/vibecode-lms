# Project: vibecode-lms

## Overview
A learning management system (LMS). Covers course catalog & authoring, enrollment & progress tracking, quizzes, assignments, certificates, AI-generated learning paths, reviews, notifications, an AI chatbot (RAG over course content), and payments.

## Tech Stack
  - Frontend: React 19/Vite, TypeScript
  - Backend: NestJS v11, TypeScript
  - Database: MySQL 8+
  - ORM: Prisma (planned — not installed yet)

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

Not configured yet — no `.claude/commands` or `.claude/skills` exist in this repo. Both apps are still bare scaffolds (`nest new` / `npm create vite`) with no feature code, so there is nothing to generate CRUD/tests against yet.

### Important
- Always read the shared docs above BEFORE generating code
- `ARCHITECTURE.md` and `PROJECT-RULES.md` are referenced by the shared docs but don't exist yet — ask before assuming their contents
- Follow existing patterns in the codebase once feature code exists; don't invent conventions ahead of it
