import type { Notification } from '../types/notification.types';
import { NotificationItem } from './NotificationItem';

interface NotificationListProps {
  items: Notification[];
  onMarkAsRead: (id: string) => void;
}

export function NotificationList({
  items,
  onMarkAsRead,
}: NotificationListProps) {
  if (items.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
        No notifications yet.
      </p>
    );
  }

  return (
    <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
      {items.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </ul>
  );
}
