import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMarkAsRead } from '../hooks/useMarkAsRead';
import { useNotifications } from '../hooks/useNotifications';
import { useNotificationSocket } from '../hooks/useNotificationSocket';
import { NotificationList } from './NotificationList';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useNotificationSocket();
  const { data } = useNotifications(1, 5);
  const markAsRead = useMarkAsRead();
  const unreadCount = data?.items.filter((n) => !n.isRead).length ?? 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative rounded-pill p-2 text-slate-600 transition-colors hover:bg-surface-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-pill bg-danger-600 px-1 text-[10px] font-semibold text-white ring-2 ring-white dark:ring-slate-950">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-10 mt-2 w-80 overflow-hidden rounded-card border border-slate-200 bg-white shadow-popover dark:border-slate-800 dark:bg-slate-900">
          <NotificationList
            items={data?.items ?? []}
            onMarkAsRead={(id) => markAsRead.mutate(id)}
          />
          <Link
            to="/notifications"
            onClick={() => setIsOpen(false)}
            className="block border-t border-slate-100 px-4 py-2 text-center text-sm font-medium text-brand-600 transition-colors hover:bg-surface-50 dark:border-slate-800 dark:text-brand-400 dark:hover:bg-slate-800"
          >
            View all
          </Link>
        </div>
      ) : null}
    </div>
  );
}
