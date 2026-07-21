# AI Chatbot (RAG) Feature (Frontend)

## Purpose
A chat UI backed by the backend's session/message persistence and mocked retrieval-augmented reply (see backend `ai-chatbot/context.md`). Reachable at `/chat` (starts a new general session) or `/chat/:sessionId` (resumes one), optionally scoped to a course via `/chat?courseId=...`.

## Endpoints Consumed
| Method | Path | Used by |
|---|---|---|
| POST | `/chat/sessions` | `useCreateChatSession` |
| GET | `/chat/sessions/:id` | `useChatSession` |
| POST | `/chat/sessions/:id/messages` | `useSendChatMessage` |

All three implemented in `backend-nest-js/src/features/ai-chatbot`.

## Public API (via `index.ts`)
- `chatRoutes` — registers `/chat/:sessionId?` (a single route with an optional param, not two separate route entries) under `ProtectedRoute role="STUDENT"`, matching the backend's student-only guard on all three endpoints.
- `useChatSession`, `useCreateChatSession`, `useSendChatMessage`
- Types: `ChatSession`, `ChatMessage`, `SendMessageResult`

## Design Decisions
- **`ChatPage` auto-creates a session when the URL has no `:sessionId`**, then `navigate(..., { replace: true })`s to `/chat/:id` — there's no "my chat sessions" list endpoint on the backend (see its `context.md`) to pick an existing session from, so a bare `/chat` visit always starts fresh. The create call is guarded by a `useRef` flag (not just the mutation's own `isPending`/`isSuccess` state) specifically to survive React StrictMode's dev-mode double-invoke of effects, which would otherwise risk firing two `POST /chat/sessions` calls before the first one's state update flushes.
- **`useSendChatMessage` invalidates and refetches the whole session on success** rather than appending the new messages to the React Query cache by hand. The send-message endpoint's response (`API_SPEC.md` §7) only returns the assistant message, not the user message that was also just persisted — reconstructing both from a partial response would duplicate logic the `GET` endpoint already provides correctly. Same "invalidate on success" tradeoff `reviews`/`notifications`/`learning-paths` all make.
- **No streaming** — the backend's `chat.message.stream` WS event is explicitly not implemented (no real LLM to stream tokens from), so `ChatComposer`/`ChatWindow` just wait for the full synchronous HTTP response, same as any other mutation in this codebase.
- **"Ask the AI assistant about this course" link added to `courses`' `CourseDetailPage`** (`/chat?courseId=<id>`), gated to `role === 'STUDENT'` — the one cross-feature entry point built, since without it `/chat` would only be reachable by typing the URL directly (same discoverability gap `notifications`/`learning-paths` document, but this one case was cheap enough to close by composing a single `Link` into an existing page, matching the precedent `enrollment`'s `EnrollButton` and `reviews`' `CourseReviews` already set for being composed into `CourseDetailPage`).
- **`ChatComposer` uses local `useState`, not `react-hook-form`** — same precedent `certificates`' `VerifyCodeForm` already established for a single, unvalidated text input; a full form schema would be overkill for "is this string non-empty after trimming."

## Known Constraints / Deferred
- No session list / history browser — mirrors the backend's missing "my sessions" endpoint.
- No per-message loading indicator distinguishing "your message sent" from "assistant is replying" — `useSendChatMessage.isPending` covers the whole round trip as one state, disabling the composer until the full response (including the mocked assistant reply) comes back.
- No `sourcesUsed` display — the backend returns retrieved chunk IDs in the send-message response, but since the message list is reconstructed via refetch (not from that response directly), the UI doesn't currently surface which chunks backed a given reply. Revisit if/when `ChatMessage` itself gains a `sourcesUsed` field server-side.
