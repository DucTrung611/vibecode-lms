import { Link, NavLink } from 'react-router-dom';
import { useLogout } from '@/features/identity';
import { NotificationBell } from '@/features/notifications';
import { useAuth } from '@/app/providers/auth-context';
import { useAuthStore } from '@/shared/stores/auth.store';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium ${isActive ? 'text-purple-600' : 'text-gray-600 hover:text-gray-900'}`;

export function Header() {
  const { isAuthenticated } = useAuth();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/courses" className="text-lg font-semibold text-purple-600">
          vibecode-lms
        </Link>

        <nav className="flex flex-1 items-center gap-6">
          <NavLink to="/courses" className={navLinkClass}>
            Courses
          </NavLink>
          <NavLink to="/learning-paths" className={navLinkClass}>
            Learning Paths
          </NavLink>
          {user?.role === 'STUDENT' ? (
            <>
              <NavLink to="/my-courses" className={navLinkClass}>
                My courses
              </NavLink>
              <NavLink to="/orders" className={navLinkClass}>
                Orders
              </NavLink>
              <NavLink to="/chat" className={navLinkClass}>
                Ask AI
              </NavLink>
            </>
          ) : null}
          {user?.role === 'INSTRUCTOR' ? (
            <NavLink to="/instructor/courses/new" className={navLinkClass}>
              New course
            </NavLink>
          ) : null}
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <Link
                to="/profile"
                className="text-sm font-medium text-gray-700 hover:underline"
              >
                {user?.fullName ?? 'Profile'}
              </Link>
              <button
                type="button"
                onClick={() => logout.mutate()}
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-700 hover:underline"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium text-purple-600 hover:underline"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
