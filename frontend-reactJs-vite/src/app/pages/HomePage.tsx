import { Link } from 'react-router-dom';
import { useAuth } from '@/app/providers/auth-context';

const HIGHLIGHTS = [
  {
    title: 'Structured courses',
    description:
      'Video lessons, readings, and hands-on assignments organized into modules you can follow at your own pace.',
    iconPath:
      'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
  },
  {
    title: 'Quizzes & assignments',
    description:
      'Test your understanding with auto-graded quizzes and submit assignments for instructor feedback.',
    iconPath:
      'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z',
  },
  {
    title: 'AI study assistant',
    description:
      'Ask questions about any course and get answers grounded in the actual lesson content, any time.',
    iconPath:
      'M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z',
  },
  {
    title: 'Certificates',
    description:
      'Earn a verifiable certificate when you complete a course, shareable with a public verification link.',
    iconPath:
      'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  },
];

export function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-16 pb-8 sm:space-y-24">
      <section className="flex flex-col items-center gap-6 py-10 text-center sm:py-16">
        <span className="rounded-pill bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
          Learn something new today
        </span>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-100">
          Grow your skills with{' '}
          <span className="text-brand-600 dark:text-brand-400">vibecode-lms</span>
        </h1>
        <p className="max-w-xl text-base text-slate-600 sm:text-lg dark:text-slate-400">
          Courses, quizzes, assignments, and an AI study assistant in one
          place — built to help you go from curious to certified.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/courses"
            className="rounded-control bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Start learning
          </Link>
          {isAuthenticated ? (
            <Link
              to="/my-courses"
              className="rounded-control border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-surface-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Go to my courses
            </Link>
          ) : (
            <Link
              to="/register"
              className="rounded-control border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-surface-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Create a free account
            </Link>
          )}
        </div>
      </section>

      <section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map((item) => (
            <div
              key={item.title}
              className="rounded-card border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-control bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={item.iconPath}
                  />
                </svg>
              </span>
              <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-center gap-4 rounded-card bg-brand-600 px-6 py-10 text-center shadow-card sm:py-14">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Ready to get started?
        </h2>
        <p className="max-w-md text-sm text-brand-100 sm:text-base">
          Browse the catalog and enroll in your first course in a couple of
          clicks — no credit card required for free courses.
        </p>
        <Link
          to="/courses"
          className="rounded-control bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 shadow-sm transition-colors hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Browse courses
        </Link>
      </section>
    </div>
  );
}
