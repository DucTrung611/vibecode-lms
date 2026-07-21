import { Skeleton } from '@/shared/components/Skeleton';
import { NotificationList } from '../components/NotificationList';
import { useMarkAsRead } from '../hooks/useMarkAsRead';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationsPage() {
  const { data, isPending, isError } = useNotifications();
  const markAsRead = useMarkAsRead();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-red-600">Could not load your notifications.</p>
      ) : (
        <div className="rounded-lg border border-gray-200">
          <NotificationList
            items={data?.items ?? []}
            onMarkAsRead={(id) => markAsRead.mutate(id)}
          />
        </div>
      )}
    </div>
  );
}
