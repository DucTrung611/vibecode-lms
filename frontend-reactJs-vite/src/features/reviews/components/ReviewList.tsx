import { useState } from 'react';
import { Pagination } from '@/shared/components/Pagination';
import { Skeleton } from '@/shared/components/Skeleton';
import { ReviewCard } from './ReviewCard';
import { useCourseReviews } from '../hooks/useCourseReviews';

interface ReviewListProps {
  courseId: string;
}

export function ReviewList({ courseId }: ReviewListProps) {
  const [page, setPage] = useState(1);
  const { data, isPending, isError } = useCourseReviews(courseId, page);

  if (isPending) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-card" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-card border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-700/40 dark:bg-danger-700/10 dark:text-danger-500">
        Could not load reviews.
      </p>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        No reviews yet. Be the first to share your thoughts on this course.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {data.items.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </ul>
      <Pagination meta={data.meta} onPageChange={setPage} />
    </div>
  );
}
