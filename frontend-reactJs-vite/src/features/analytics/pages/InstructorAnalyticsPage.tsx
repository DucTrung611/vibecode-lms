import { Link } from 'react-router-dom';
import { Skeleton } from '@/shared/components/Skeleton';
import { StatCard } from '@/shared/components/StatCard';
import { CourseAnalyticsTable } from '../components/CourseAnalyticsTable';
import { useInstructorOverview } from '../hooks/useInstructorOverview';

export default function InstructorAnalyticsPage() {
  const { data, isPending, isError } = useInstructorOverview();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Analytics</h1>

      {isPending ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-card" />
            ))}
          </div>
          <Skeleton className="h-48 w-full rounded-card" />
        </div>
      ) : isError ? (
        <div className="rounded-card border border-danger-200 bg-danger-50 px-4 py-10 text-center dark:border-danger-500/30 dark:bg-danger-500/10">
          <p className="text-sm font-medium text-danger-700 dark:text-danger-400">
            Could not load analytics. Please try again later.
          </p>
        </div>
      ) : data && data.courses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Courses" value={String(data.totals.totalCourses)} />
            <StatCard label="Students" value={String(data.totals.totalStudents)} />
            <StatCard label="Revenue" value={`$${data.totals.totalRevenue.toFixed(2)}`} />
            <StatCard
              label="Average rating"
              value={
                data.totals.averageRating !== null
                  ? `${data.totals.averageRating.toFixed(1)} ★`
                  : '—'
              }
            />
          </div>
          <CourseAnalyticsTable courses={data.courses} />
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-surface-200 px-4 py-16 text-center dark:border-slate-700">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            You don't have any courses yet.
          </p>
          <Link
            to="/instructor/courses/new"
            className="font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
          >
            Create your first course →
          </Link>
        </div>
      )}
    </div>
  );
}
