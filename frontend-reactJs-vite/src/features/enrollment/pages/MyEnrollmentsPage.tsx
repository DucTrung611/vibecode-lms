import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pagination } from '@/shared/components/Pagination';
import { Skeleton } from '@/shared/components/Skeleton';
import { useMyEnrollments } from '../hooks/useMyEnrollments';
import type { EnrollmentStatus } from '../types/enrollment.types';

const STATUS_CLASSES: Record<EnrollmentStatus, string> = {
  ACTIVE: 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300',
  COMPLETED:
    'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400',
  CANCELLED: 'bg-surface-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

export default function MyEnrollmentsPage() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError } = useMyEnrollments(page);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          My courses
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Courses you're enrolled in and their status.
        </p>
      </div>

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-card" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-card border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700 dark:border-danger-500/30 dark:bg-danger-500/10 dark:text-danger-400">
          Could not load your enrollments. Please try again later.
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          <ul className="space-y-3">
            {data.items.map((enrollment) => (
              <li
                key={enrollment.id}
                className="flex items-center justify-between gap-4 rounded-card border border-slate-200 bg-surface-0 p-4 shadow-card transition-shadow hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900 sm:p-5"
              >
                <div className="min-w-0">
                  <Link
                    to={`/courses/${enrollment.courseId}`}
                    className="rounded-control font-medium text-slate-900 transition-colors hover:text-brand-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 dark:text-slate-100 dark:hover:text-brand-400"
                  >
                    {enrollment.course?.title ?? 'Untitled course'}
                  </Link>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    Enrolled{' '}
                    {new Date(enrollment.enrolledAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-pill px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[enrollment.status]}`}
                >
                  {enrollment.status}
                </span>
              </li>
            ))}
          </ul>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      ) : (
        <div className="rounded-card border border-dashed border-slate-300 bg-surface-0 p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            You haven't enrolled in any courses yet.
          </p>
          <Link
            to="/courses"
            className="mt-3 inline-flex rounded-control text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
          >
            Browse courses →
          </Link>
        </div>
      )}
    </div>
  );
}
