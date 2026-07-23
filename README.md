# Vibecode LMS

A full-stack Learning Management System covering course catalog & authoring, enrollment & progress tracking, quizzes, assignments, certificates, AI-generated learning paths, reviews, notifications, an AI chatbot (RAG over course content), and payments.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TypeScript, TailwindCSS, Zustand, React Query |
| Backend | NestJS v11, TypeScript |
| Database | MySQL 8+ |
| ORM | Prisma |

## Project Structure

```
├── backend-nest-js/       # NestJS API — see backend-nest-js/CLAUDE.md
├── frontend-reactJs-vite/ # React + Vite SPA — see frontend-reactJs-vite/CLAUDE.md
└── share-docs/            # Shared API & database docs (API_SPEC.md, DATABASE.md)
```

Each app follows a feature-based architecture — one folder per business capability (courses, quizzes, assignments, chatbot, etc.), mirrored between frontend and backend. See each app's `docs/ARCHITECTURE.md` and `docs/PROJECT-RULES.md` for conventions.

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8+

### Install dependencies
```bash
npm install
npm install --prefix backend-nest-js
npm install --prefix frontend-reactJs-vite
```

### Run in development
```bash
npm run dev
```
This runs the backend (`start:dev`) and frontend (`dev`) concurrently. To run them individually:
```bash
npm run dev:backend
npm run dev:frontend
```

## Documentation

- [API_SPEC.md](share-docs/API_SPEC.md) — REST API contract, auth flow, error codes
- [DATABASE.md](share-docs/DATABASE.md) — Entity/schema reference, Prisma conventions
- [backend-nest-js/CLAUDE.md](backend-nest-js/CLAUDE.md) — Backend architecture & rules
- [frontend-reactJs-vite/CLAUDE.md](frontend-reactJs-vite/CLAUDE.md) — Frontend architecture & rules
