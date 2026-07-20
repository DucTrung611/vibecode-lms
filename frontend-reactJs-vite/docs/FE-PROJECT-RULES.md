# PROJECT-RULES.md — Frontend (Feature-based)

## Tech Stack
- **Framework**: React 19 + TypeScript (Vite)
- **State management**: Zustand (client state) + React Query (server state/cache)
- **Styling**: TailwindCSS
- **HTTP client**: Axios (wrapped in per-feature service files)

## 1. Feature Structure

```
src/features/quiz/
├── components/
│   ├── QuizCard.tsx
│   └── QuizAttemptForm.tsx
├── hooks/
│   ├── useQuizAttempt.ts
│   └── useQuizTimer.ts
├── services/
│   └── quiz.service.ts        # axios calls only
├── stores/
│   └── quiz.store.ts          # zustand slice (if feature needs client state)
├── types/
│   └── quiz.types.ts
├── utils/
│   └── scoring.util.ts
├── index.ts                   # barrel — the ONLY public entry point
└── context.md
```

## 2. Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Feature folders | `kebab-case` | `learning-path/` |
| Components | `PascalCase.tsx` | `QuizCard.tsx` |
| Hooks | `use<Name>.ts` | `useQuizAttempt.ts` |
| Services | `<name>.service.ts` | `quiz.service.ts` |
| Types | `PascalCase`, file `<name>.types.ts` | `QuizAttempt`, `quiz.types.ts` |
| Stores | `<name>.store.ts` | `quiz.store.ts` |

## 3. Feature Rules

- Feature is self-contained: owns its components, hooks, services, store, types.
- **Export only via `index.ts`** — every cross-feature usage goes through the barrel:
  ```ts
  // features/quiz/index.ts
  export { QuizCard } from './components/QuizCard';
  export { useQuizAttempt } from './hooks/useQuizAttempt';
  ```
- **No direct imports** between feature internals (`import { quizApi } from '../quiz/services/quiz.service'` from `assignment` feature is forbidden).
- Cross-feature communication via:
  - **Global state** — only for truly cross-cutting data (`auth`, `currentUser`), kept minimal in `src/shared/stores`.
  - **Events** — custom event bus (`mitt`) for decoupled side effects (e.g., `quiz:completed` → `learning-path` feature refetches progress).
  - **URL params** — pass IDs/filters between features via routing, not shared state.
- Shared components location: `src/shared/components/` (e.g., `Button`, `Modal`, `Skeleton`).

## 4. Component Rules

- One component per file; filename matches the exported component.
- Co-locate: `ComponentName.tsx`, styles via Tailwind classes inline (no separate CSS unless complex), test in `tests/ComponentName.spec.tsx`.
- **Props typing required** — no implicit `any`:
  ```tsx
  interface QuizCardProps {
    quiz: Quiz;
    onStart: (quizId: string) => void;
  }
  export function QuizCard({ quiz, onStart }: QuizCardProps) { ... }
  ```
- **Max ~150 lines per component** — extract sub-components or hooks beyond that.

## 5. Code Patterns (MUST follow)

- **API calls**: only inside `services/*.service.ts`, wrapped by React Query hooks in `hooks/`:
  ```ts
  // services/quiz.service.ts
  export const quizService = {
    getById: (id: string) => api.get<Quiz>(`/quizzes/${id}`),
  };
  // hooks/useQuiz.ts
  export const useQuiz = (id: string) =>
    useQuery(['quiz', id], () => quizService.getById(id));
  ```
- **State**: local (`useState`) first; promote to Zustand store only when shared across components/features.
- **Error handling**: `ErrorBoundary` per route + toast notifications (`react-hot-toast`) for API errors surfaced from React Query's `onError`.
- **Loading states**: skeleton components (`shared/components/Skeleton`) for content, spinners for actions/buttons.
- **Form handling**: `react-hook-form` + `zod` schema validation, one schema per form co-located in the feature's `types/`.

## 6. Anti-patterns (MUST NOT do)

| ❌ DON'T | ✅ DO |
|---|---|
| `import { QuizCard } from '../quiz/components/QuizCard'` | `import { QuizCard } from '@/features/quiz'` (via barrel) |
| `axios.get('/quizzes/1')` inside a component | Call through `quizService` + a React Query hook |
| Score calculation logic written inside `QuizAttemptForm.tsx` | Move to `utils/scoring.util.ts` or `hooks/useQuizAttempt.ts` |
| Passing `user` through 5 layers of props | Read from `useAuthStore()` (shared global store) |
| `const [data, setData]: any = useState()` | Explicit typed state: `useState<Quiz | null>(null)` |
| `<div style={{ color: 'red' }}>` | `<div className="text-red-500">` |

## 7. Git Workflow

- **Branch naming**: `<type>/<feature>-<short-desc>` → `feat/quiz-attempt-timer`.
- **Commit message**: Conventional Commits → `fix(quiz): correct score rounding`.
- **PR scope**: one feature per PR when possible; PR description lists which feature folder(s) changed and links updated `context.md`.

## 8. Testing

- **Location**: co-located `features/<feature>/tests/`.
- **What to test**: hooks (React Query logic mocked), utils (pure functions), critical component interactions (form submit, error states) — skip trivial presentational components.
- **Coverage focus**: `hooks/` and `utils/` prioritized (≥80%); components covered via key interaction tests, not exhaustive snapshot testing.

## [React-Specific Additions]

- **Lifecycle**: side effects only in `useEffect` with explicit dependency arrays; no effect-based data fetching — use React Query instead.
- **Reactivity**: Zustand stores expose selectors (`useQuizStore(s => s.currentAttempt)`) to avoid unnecessary re-renders; never destructure the whole store.
- **Suspense**: React Query configured with `suspense: false` by default; opt into Suspense boundaries only for route-level data.