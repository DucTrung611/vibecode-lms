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
| POST | `/chat/sessions/:id/messages` | ✅ (real LLM reply when configured, keyword-retrieval fallback otherwise — see Design Decisions) |
| GET | `/chat/sessions/:id` | ✅ |

## Public API (for other features to inject)
- `ChatService` — exported via `AiChatbotModule.exports`. No other feature consumes it yet.

This feature injects `CoursesService` (from `CoursesModule`) — never `CourseRepository` directly — to validate `courseId` when starting a course-scoped session. It also injects `AiClientService` (from the global `CoreModule`, see `core/ai/ai-client.service.ts`) for the real completion path below.

## Design Decisions
- **Retrieval** (`utils/retrieval.util.ts`) is unchanged: naive keyword-overlap scoring over the session's course's `document_chunks` — no embeddings, no vector store, consistent with `DATABASE.md`'s own framing of the JSON `embedding` column as an "MVP fallback" pending a real vector store. This still runs regardless of whether a real AI provider is configured, since its output (`sourcesUsed`, and the fallback reply's content) is used either way.
- **Reply generation now has two paths**, chosen by `ChatService.generateReply` at request time:
  1. **Real LLM completion** (`AiClientService.complete`) when `AI_PROVIDER_API_KEY`/`AI_PROVIDER_BASE_URL` are configured — the retrieved chunks are joined into a system-prompt "use only this course material" instruction, and the student's message is sent as the user turn.
  2. **Keyword-retrieval template** (`utils/reply.util.ts`, unchanged) — used when no provider is configured, *and* as a safety-net fallback if the configured provider call throws for any reason (network failure, non-2xx, empty response). The `sendMessage` request never fails outright just because the AI call failed; it degrades to the deterministic reply instead.
  - This turns the previous "fully deferred, no AI client exists" situation `quizzes`/`learning-paths` still cite for their own generate routes into "implemented, verified against a mocked provider response; needs real `AI_PROVIDER_API_KEY`/`AI_PROVIDER_BASE_URL` credentials to exercise path 1 live" — nobody on this task had provider credentials to test against a live API, so path 1 is unverified end-to-end against a real provider, only against `AiClientService`'s own contract (which *is* unit-tested with a mocked `fetch`).
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
