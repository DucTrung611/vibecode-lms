# PROJECT-RULES.md — Backend (Feature-based)

## Tech Stack
- **Language**: TypeScript
- **Framework**: NestJS
- **ORM**: Prisma (MySQL)

## 1. Feature Structure

```
src/features/course/
├── course.controller.ts
├── course.service.ts
├── course.repository.ts
├── dto/
│   ├── create-course.dto.ts
│   └── update-course.dto.ts
├── entities/
│   └── course.entity.ts
├── types/
│   └── course.types.ts
├── utils/
│   └── course.util.ts
├── tests/
│   ├── course.service.spec.ts
│   └── course.controller.spec.ts
├── course.module.ts
└── context.md
```

`context.md` documents: feature purpose, owned entities, public API (what other features may call via shared service), and known constraints.

## 2. Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Feature folder | `kebab-case` | `learning-path/` |
| Files | `<name>.<layer>.ts` | `quiz.service.ts`, `create-quiz.dto.ts` |
| Classes | `PascalCase` | `QuizService`, `CreateQuizDto` |
| Functions/methods | `camelCase` | `getQuizById()` |
| Variables/constants | `camelCase`; global constants `UPPER_SNAKE_CASE` | `maxAttempts`, `MAX_QUIZ_ATTEMPTS` |
| Interfaces/Types | `PascalCase`, no `I` prefix | `QuizAttemptResult` |

## 3. Feature Rules

- Each feature is **self-contained**: owns its controller, service, repository, DTOs, entities.
- **No direct imports** between feature internals (e.g., `assignment.service.ts` must never `import { QuizRepository } from '../quiz/quiz.repository'`).
- Cross-feature communication via:
  - **Shared services** exposed through the feature's `*.module.ts` exports (e.g., `CourseModule` exports `CourseService` for `EnrollmentModule` to inject).
  - **Events** (`@nestjs/event-emitter`) for side effects (e.g., `enrollment.completed` → certificate feature listens and generates certificate).
  - **Dependency injection** only through a feature's public module exports — never reach into another feature's folder path.
- Shared code location: `src/shared/` (e.g., `shared/prisma`, `shared/guards`, `shared/decorators`, `shared/filters`).

## 4. Code Patterns (MUST follow)

**Error handling** — throw Nest exceptions in service layer, never in repository:
```ts
// service
if (!course) throw new NotFoundException('Course not found');
```

**Validation** — `class-validator` on DTOs, enforced globally via `ValidationPipe`:
```ts
export class CreateCourseDto {
  @IsString() @IsNotEmpty()
  title: string;
}
```

**Logging** — inject Nest `Logger` per feature, never `console.log`:
```ts
private readonly logger = new Logger(CourseService.name);
this.logger.error(`Failed to enroll student ${studentId}`, err.stack);
```

**Response format** — consistent envelope via global interceptor:
```json
{ "success": true, "data": { }, "message": "OK" }
```

## 5. Anti-patterns (MUST NOT do)

| ❌ DON'T | ✅ DO |
|---|---|
| `import { CourseRepository } from '../course/course.repository'` inside `enrollment` feature | Inject `CourseService` via `CourseModule` exports |
| Circular imports between `quiz` ↔ `assignment` modules | Extract shared logic to `shared/` or emit an event |
| Business logic (score calculation) written in `*.controller.ts` | Move logic to `*.service.ts`; controller only maps HTTP ↔ service |
| `this.prisma.course.findMany()` called inside a service | Only `*.repository.ts` may call `this.prisma.*` |
| `const dbUrl = "mysql://root:pass@localhost"` hardcoded | Use `ConfigService` reading from `.env` |

## 6. Git Workflow

- **Branch naming**: `<type>/<feature>-<short-desc>` → `feat/quiz-ai-generation`, `fix/enrollment-duplicate-check`.
- **Commit message** (Conventional Commits): `<type>(<feature>): <description>` → `feat(quiz): add AI-generated quiz support`.
- **PR requirements**: passes lint + tests in CI; description links the feature's `context.md` if updated; at least 1 reviewer approval; no direct commits to `main`.

## 7. Testing

- **Location**: co-located inside `features/<feature>/tests/`.
- **Naming**: `<name>.service.spec.ts`, `<name>.controller.spec.ts`, `<name>.e2e-spec.ts` (e2e lives in root `test/`).
- **Structure**: Arrange–Act–Assert, one `describe` per method, mock repository layer via Jest (`jest.mock` or Nest `Test.createTestingModule`).
- **Coverage requirement**: ≥ 80% for `service` and `repository` layers; controllers may rely on e2e coverage instead of unit coverage.

## [NestJS-Specific Additions]

- Every feature exposes a `<Feature>Module` with explicit `imports`, `providers`, `exports` — only `exports` are visible cross-feature.
- Use `@Injectable()` decorators consistently; never instantiate services manually (`new CourseService()`).
- Global pipes/filters/interceptors (`ValidationPipe`, `HttpExceptionFilter`, `ResponseInterceptor`) registered once in `main.ts`, not per-feature.
- Prisma access is centralized via a single `PrismaService` in `shared/prisma/prisma.service.ts`, injected into each feature's repository only.