import type { Notification } from '../types/notification.types';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  return (
    <li
      className={
        notification.isRead
          ? 'bg-white transition-colors dark:bg-slate-900'
          : 'bg-brand-50 transition-colors dark:bg-brand-950/40'
      }
    >
      <div className="flex items-start justify-between gap-2 px-4 py-3 text-sm">
        <div className="min-w-0">
          <p
            className={
              notification.isRead
                ? 'font-medium text-slate-700 dark:text-slate-300'
                : 'font-semibold text-slate-900 dark:text-slate-100'
            }
          >
            {notification.title}
          </p>
          <p className="mt-0.5 text-slate-600 dark:text-slate-400">
            {notification.content}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {new Date(notification.createdAt).toLocaleString()}
          </p>
        </div>
        {!notification.isRead ? (
          <button
            type="button"
            onClick={() => onMarkAsRead(notification.id)}
            className="shrink-0 rounded-control px-2 py-1 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-100 hover:text-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:bg-brand-200 dark:text-brand-400 dark:hover:bg-brand-900/40 dark:hover:text-brand-300"
          >
            Mark read
          </button>
        ) : null}
      </div>
    </li>
  );
}
