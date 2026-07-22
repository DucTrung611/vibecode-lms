import { useState } from 'react';
import { Pagination } from '@/shared/components/Pagination';
import { Skeleton } from '@/shared/components/Skeleton';
import { NotificationList } from '../components/NotificationList';
import { useMarkAsRead } from '../hooks/useMarkAsRead';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError } = useNotifications(page);
  const markAsRead = useMarkAsRead();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Notifications
      </h1>

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-card" />
          ))}
        </div>
      ) : isError ? (
        <p className="rounded-card border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-700/40 dark:bg-danger-700/10 dark:text-danger-500">
          Could not load your notifications.
        </p>
      ) : (
        <>
          <div className="overflow-hidden rounded-card border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
            <NotificationList
              items={data?.items ?? []}
              onMarkAsRead={(id) => markAsRead.mutate(id)}
            />
          </div>
          {data ? <Pagination meta={data.meta} onPageChange={setPage} /> : null}
        </>
      )}
    </div>
  );
}
