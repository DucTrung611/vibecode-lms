# Notifications Feature

## Purpose
In-app notifications: a REST list/mark-read API for any authenticated user, plus a realtime push (`notification.new` over WebSocket, per `API_SPEC.md`'s `[Tech-Specific Additions]`) the moment a notification is created. This is the first WebSocket gateway in the codebase.

## Owned Entities
- `Notification` (`notifications` table)

## Endpoints Implemented (API_SPEC.md §6 Notifications)
| Method | Path | Status |
|---|---|---|
| GET | `/notifications` | ✅ |
| PATCH | `/notifications/:id/read` | ✅ |

Both REST endpoints implemented. The WebSocket side (`notification.new`, namespace `/realtime`, token-in-query handshake auth) documented in `API_SPEC.md`'s `[Tech-Specific Additions]` is also implemented — see `gateways/notifications.gateway.ts`.

## Public API (for other features to inject)
- `NotificationsService` — exported via `NotificationsModule.exports`. The method other features will want is `notify(userId, type, title, content): Promise<NotificationEntity>` — it persists the row and pushes it over the socket in one call. **No feature currently calls it** (no other feature imports `NotificationsModule` yet) — wiring it into, say, `assignments` (grade posted) or `quizzes` (attempt graded) would mean modifying already-shipped, tested features' service/module files for a UX enhancement nobody asked for yet. Deferred deliberately (YAGNI), same reasoning `enrollment` used before `certificates` existed to consume `isEnrolled`.

## Design Decisions
- **New dependencies**: `@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io` (all pinned to major versions matching the existing `@nestjs/*` v11 packages). Unlike the AI-provider/payment-gateway integrations deferred elsewhere in this codebase, WebSocket support needs no external account/API key/cost — it's fully implementable with a plain `npm install`, so there was no reason to defer it the way `quizzes`' AI-generate or `payments` are deferred.
- **`WsAuthGuard` is not a `CanActivate`-style guard** (despite the name and despite `API_SPEC.md` calling it "a WS-specific guard"): Nest's guard pipeline (`@UseGuards`) applies to `@SubscribeMessage` handlers, not to `handleConnection`/`handleDisconnect` lifecycle hooks — by the time a guard could run, the socket is already connected. So `WsAuthGuard.verifyToken(token)` is a plain injectable method, called manually inside `NotificationsGateway.handleConnection`, which disconnects the socket immediately if the token is missing or invalid. It lives in `shared/guards/` anyway (not `notifications/`) because the same token-in-query handshake pattern applies to `chat.message.stream` (the `ai-chatbot` feature, not yet built) per `API_SPEC.md`'s same `[Tech-Specific Additions]` section — this is shared WS infrastructure, not notifications-specific.
- **`WsAuthGuard` doesn't reuse `identity`'s `JwtAccessPayload` type**: importing it would mean reaching into another feature's `types/` folder. It declares its own minimal local `WsJwtPayload` shape (`sub`/`email`/`role`) instead — the same boundary respected everywhere else in this codebase, just applied to a type instead of a service/repository.
- **`NotificationsModule` registers its own `JwtModule.registerAsync(...)`** (identical factory to `IdentityModule`'s) rather than modifying `IdentityModule` to export `JwtModule` — a second `JwtService` instance configured with the same secret is harmless and avoids touching a stable, already-tested feature module just to expose a low-level utility outside its own HTTP auth flow.
- **In-memory `userId → socketId[]` map** in `NotificationsGateway`: a `Notification` row's target user might have zero, one, or several open tabs/devices connected; the map lets `emitNewNotification` push to every open connection for that user, and cleans itself up on disconnect. This does **not** survive a server restart or work across multiple server instances (no Redis/pub-sub adapter) — fine for this phase (single-instance dev/deploy), called out below since it would need a shared adapter (e.g. `@socket.io/redis-adapter`) to scale horizontally.
- **No `create-notification.dto.ts`**: notifications are never created via an HTTP body — only through `NotificationsService.notify()`, called by other features' service code. Same deviation already documented by `enrollment`/`certificates`/`reviews` for their own missing DTOs.

## Error Codes
Reuses `AUTH_003` (403, ownership — `PATCH /notifications/:id/read` on someone else's notification). Adds one new code, following the `NOTIFICATION_[NUMBER]` format (not yet in `API_SPEC.md` §5):

| Code | HTTP | Meaning |
|---|---|---|
| `NOTIFICATION_001` | 404 | Notification not found |

`share-docs/API_SPEC.md` §5 should be updated to include `NOTIFICATION_001` the next time it's revised.

## Known Constraints / Deferred
- No horizontal-scaling support for the WebSocket layer (no Redis adapter) — see the in-memory map note above.
- No "mark all as read" endpoint — not in `API_SPEC.md`.
- No notification preferences/opt-out — not in `API_SPEC.md`/`DATABASE.md`.
- Nothing calls `NotificationsService.notify()` yet — see Public API above.
