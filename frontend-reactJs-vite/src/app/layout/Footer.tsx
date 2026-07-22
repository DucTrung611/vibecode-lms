import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <span className="flex h-6 w-6 items-center justify-center rounded-control bg-brand-600 text-xs font-bold text-white">
            V
          </span>
          vibecode-lms
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
          <Link
            to="/courses"
            className="transition-colors hover:text-slate-900 dark:hover:text-slate-200"
          >
            Courses
          </Link>
          <Link
            to="/learning-paths"
            className="transition-colors hover:text-slate-900 dark:hover:text-slate-200"
          >
            Learning Paths
          </Link>
          <Link
            to="/certificates/verify"
            className="transition-colors hover:text-slate-900 dark:hover:text-slate-200"
          >
            Verify certificate
          </Link>
        </nav>

        <p className="text-xs text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} vibecode-lms. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
