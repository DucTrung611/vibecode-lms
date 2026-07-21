# AI Chatbot (RAG) Feature

## Purpose
Chat sessions (optionally scoped to a course) where a student's message gets a retrieval-augmented reply drawn from that course's `document_chunks`.

## Owned Entities
- `ChatSession` (`chat_sessions` table)
- `ChatMessage` (`chat_messages` table)
- `DocumentChunk` (`document_chunks` table) — **read-only** here; nothing in `API_SPEC.md` creates chunks (see Known Constraints).

## Endpoints Implemented (API_SPEC.md §6/§7 AI Chatbot)
| Method | Path | Status |
|---|---|---|
| POST | `/chat/sessions` | ✅ |
| POST | `/chat/sessions/:id/messages` | ✅ (mocked retrieval + reply, see Design Decisions) |
| GET | `/chat/sessions/:id` | ✅ |

## Public API (for other features to inject)
- `ChatService` — exported via `AiChatbotModule.exports`. No other feature consumes it yet.

This feature injects `CoursesService` (from `CoursesModule`) — never `CourseRepository` directly — to validate `courseId` when starting a course-scoped session.

## Design Decisions
- **No real LLM call, no vector similarity search.** Unlike `quizzes`' `POST /lessons/:id/quizzes/generate` or `learning-paths`' `POST /learning-paths/generate` — both fully **deferred** because there is no AI provider client in this codebase (only unused placeholder `AI_PROVIDER_API_KEY`/`AI_PROVIDER_BASE_URL` config) — this feature's entire purpose *is* the AI reply, so deferring it would mean building nothing at all. Instead, `POST /chat/sessions/:id/messages` implements a genuinely working but deliberately primitive stand-in:
  - **Retrieval** (`utils/retrieval.util.ts`): naive keyword-overlap scoring over the session's course's `document_chunks` — no embeddings, no vector store, consistent with `DATABASE.md`'s own framing of the JSON `embedding` column as an "MVP fallback" pending a real vector store.
  - **Reply generation** (`utils/reply.util.ts`): a fixed template that lists the retrieved chunks' content (or a generic "I don't have specific course material" message if none matched) — not an LLM completion.
  - Both are pure functions, fully unit-tested, with zero external calls. Revisit both the moment a real AI provider client exists (same trigger condition `quizzes`/`learning-paths` already name for their own deferred routes).
- **Sessions with no `courseId` skip retrieval entirely** and always get the generic fallback reply — there's no course to search `document_chunks` against. `API_SPEC.md` allows `courseId` to be optional ("optionally scoped to a course"), so this is a valid, if low-value, path rather than a rejected request.
- **`sourcesUsed` in the response is the retrieved chunks' IDs** — matches `API_SPEC.md` §7's exact example shape (`"sourcesUsed": ["chunk_12", "chunk_15"]`).
- **No rate limiting**: `API_SPEC.md` §7 documents `429 CHAT_002` for "rate limit on AI calls exceeded," but there's no real AI provider being called, so nothing to rate-limit against yet — not implemented (see Known Constraints).

## Error Codes
`CHAT_001` (404, session not found) was already named in `API_SPEC.md` §7 endpoint details and is implemented as documented. `AUTH_003` (403, ownership) reuses the existing cross-feature convention.

`share-docs/API_SPEC.md` §5 should be updated to include `CHAT_001` in the main table the next time it's revised (currently only appears in the §7 endpoint-detail prose).

## Known Constraints / Deferred
- No endpoint creates `DocumentChunk` rows — indexing course content into chunks (chunking + embedding pipeline) isn't specified anywhere in `API_SPEC.md`/`DATABASE.md` beyond the table shape itself. Chunks must be seeded out-of-band for retrieval to ever return results; without seeded chunks, every course-scoped session still gets the generic fallback reply (not a bug — there's simply nothing to retrieve).
- `CHAT_002` (429 rate limit) is not implemented — no real AI provider to protect.
- `chat.message.stream` WebSocket event (`API_SPEC.md`'s Tech-Specific Additions) is not implemented — streaming only makes sense once there's a real token-by-token LLM response to stream; this feature returns the full reply synchronously in the HTTP response instead.
- No session list endpoint (`GET /chat/sessions` — "my sessions") — not specified in `API_SPEC.md`, same gap `learning-paths` has for "my learning paths."
