import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { NotificationBell } from '@/features/notifications';
import { useAuth } from '@/app/providers/auth-context';
import { useAuthStore } from '@/shared/stores/auth.store';
import { UserMenu } from './UserMenu';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-control px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
      : 'text-slate-600 hover:bg-surface-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
  }`;

export function Header() {
  const { isAuthenticated } = useAuth();
  const user = useAuthStore((s) => s.user);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = (
    <>
      <NavLink to="/courses" className={navLinkClass} onClick={() => setMobileOpen(false)}>
        Courses
      </NavLink>
      <NavLink
        to="/learning-paths"
        className={navLinkClass}
        onClick={() => setMobileOpen(false)}
      >
        Learning Paths
      </NavLink>
      {user?.role === 'STUDENT' ? (
        <>
          <NavLink
            to="/my-courses"
            className={navLinkClass}
            onClick={() => setMobileOpen(false)}
          >
            My courses
          </NavLink>
          <NavLink to="/orders" className={navLinkClass} onClick={() => setMobileOpen(false)}>
            Orders
          </NavLink>
          <NavLink to="/chat" className={navLinkClass} onClick={() => setMobileOpen(false)}>
            Ask AI
          </NavLink>
        </>
      ) : null}
      {user?.role === 'INSTRUCTOR' ? (
        <>
          <NavLink
            to="/instructor/courses/new"
            className={navLinkClass}
            onClick={() => setMobileOpen(false)}
          >
            New course
          </NavLink>
          <NavLink
            to="/instructor/analytics"
            className={navLinkClass}
            onClick={() => setMobileOpen(false)}
          >
            Analytics
          </NavLink>
        </>
      ) : null}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-control p-2 text-slate-600 hover:bg-surface-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 md:hidden dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-brand-700 dark:text-brand-300"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-control bg-brand-600 text-sm font-bold text-white">
              V
            </span>
            <span className="hidden sm:inline">vibecode-lms</span>
          </Link>
        </div>

        <nav className="hidden flex-1 items-center gap-1 md:flex">{navItems}</nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <UserMenu fullName={user?.fullName} />
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-control px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-surface-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-control bg-brand-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-slate-200 px-4 py-3 md:hidden dark:border-slate-800">
          {navItems}
        </nav>
      )}
    </header>
  );
}
