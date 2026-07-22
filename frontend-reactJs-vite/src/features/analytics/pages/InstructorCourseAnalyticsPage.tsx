import { Link, useParams } from 'react-router-dom';
import { Skeleton } from '@/shared/components/Skeleton';
import { StatCard } from '../components/StatCard';
import { useCourseAnalytics } from '../hooks/useCourseAnalytics';

export default function InstructorCourseAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isPending, isError } = useCourseAnalytics(id ?? '');

  if (isPending) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-card" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-3xl rounded-card border border-danger-200 bg-danger-50 px-4 py-10 text-center dark:border-danger-500/30 dark:bg-danger-500/10">
        <p className="text-sm font-medium text-danger-700 dark:text-danger-400">
          Could not load analytics for this course.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          to="/instructor/analytics"
          className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
        >
          ← Analytics
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {data.title}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Enrolled students" value={String(data.enrolledCount)} />
        <StatCard label="Completion rate" value={`${Math.round(data.completionRate * 100)}%`} />
        <StatCard label="Revenue" value={`$${data.revenue.toFixed(2)}`} />
        <StatCard
          label="Average rating"
          value={data.averageRating !== null ? `${data.averageRating.toFixed(1)} ★` : '—'}
          subLabel={`${data.reviewCount} review${data.reviewCount === 1 ? '' : 's'}`}
        />
        <StatCard
          label="Average quiz score"
          value={data.averageQuizScore !== null ? `${Math.round(data.averageQuizScore)}%` : '—'}
        />
      </div>
    </div>
  );
}
