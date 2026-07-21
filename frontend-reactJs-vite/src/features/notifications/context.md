# Notifications Feature (Frontend)

## Purpose
In-app notifications: a bell widget with unread count and a live dropdown, plus a full `/notifications` page for history. Backend already implements the REST endpoints and a `/realtime` WebSocket gateway that pushes `notification.new` events (see `backend-nest-js/src/features/notifications`).

## Endpoints Consumed
| Method | Path | Used by |
|---|---|---|
| GET | `/notifications` | `useNotifications` |
| PATCH | `/notifications/:id/read` | `useMarkAsRead` |
| WS `notification.new` (namespace `/realtime`) | — | `useNotificationSocket` |

## Public API (via `index.ts`)
- `NotificationBell` — dropdown widget (unread badge, mini list, link to `/notifications`); also owns the live socket connection via `useNotificationSocket`.
- `notificationRoutes` — registers `/notifications`.
- `useNotifications`, `useMarkAsRead`, `useNotificationSocket`
- Types: `Notification`

## Design Decisions
- **`NotificationBell` is the only place `useNotificationSocket` is called.** The app has no persistent header/nav shell yet (`App.tsx` only wraps `RouterProvider` + `Toaster`), so there's nowhere to mount the bell today. Whoever adds a global header should render `<NotificationBell />` there; until then, live push notifications are effectively dormant (REST polling via `useNotifications`'s 30s `staleTime` still works on the `/notifications` page). Documented here instead of forcing a header into scope this feature doesn't own.
- **Socket URL derived from `VITE_API_BASE_URL`**: `useNotificationSocket` strips the `/api/v1` path and connects to `<origin>/realtime`, matching `API_SPEC.md`'s WebSocket section (same host as the REST API, no separate `VITE_WS_URL` env var introduced).
- **New notification pushes trigger a query invalidation + toast**, not a manual cache splice — same low-frequency-event tradeoff other features make; simpler than hand-merging a paginated list.
- ~~No pagination controls on `/notifications`~~ **Closed**: `NotificationsPage` now lifts `page` state and renders `shared/components/Pagination.tsx`.

## Known Constraints / Deferred
- No "mark all as read" bulk action — backend only exposes per-notification `PATCH`.
- No notification preferences/settings UI — out of scope, not in `API_SPEC.md`.
- `NotificationBell` closes on outside click but not on `Escape` — minor a11y gap, same level of polish as other dropdown-less features in this codebase so far.
