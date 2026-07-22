import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';

export function RouteErrorPage() {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface-50 px-4 text-center dark:bg-slate-950">
      <Link
        to="/"
        className="flex items-center gap-2 text-lg font-bold tracking-tight text-brand-700 dark:text-brand-300"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-control bg-brand-600 text-base font-bold text-white">
          V
        </span>
        vibecode-lms
      </Link>

      <div>
        <p className="text-6xl font-bold text-brand-600 dark:text-brand-400">
          {is404 ? '404' : 'Oops'}
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {is404 ? 'Page not found' : 'Something went wrong'}
        </h1>
        <p className="mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-400">
          {is404
            ? "The page you're looking for doesn't exist or may have been moved."
            : 'An unexpected error occurred. Please try again.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="rounded-control bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          Go home
        </Link>
        <Link
          to="/courses"
          className="rounded-control border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-surface-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Browse courses
        </Link>
      </div>
    </div>
  );
}
