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
    <li className={notification.isRead ? 'bg-white' : 'bg-blue-50'}>
      <div className="flex items-start justify-between gap-2 px-4 py-3 text-sm">
        <div>
          <p className="font-medium text-gray-900">{notification.title}</p>
          <p className="mt-0.5 text-gray-600">{notification.content}</p>
          <p className="mt-1 text-xs text-gray-400">
            {new Date(notification.createdAt).toLocaleString()}
          </p>
        </div>
        {!notification.isRead ? (
          <button
            type="button"
            onClick={() => onMarkAsRead(notification.id)}
            className="shrink-0 text-xs font-medium text-blue-600 hover:underline"
          >
            Mark read
          </button>
        ) : null}
      </div>
    </li>
  );
}
