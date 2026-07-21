import { Skeleton } from '@/shared/components/Skeleton';
import { ReviewCard } from './ReviewCard';
import { useCourseReviews } from '../hooks/useCourseReviews';

interface ReviewListProps {
  courseId: string;
}

export function ReviewList({ courseId }: ReviewListProps) {
  const { data, isPending, isError } = useCourseReviews(courseId);

  if (isPending) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-red-600">Could not load reviews.</p>;
  }

  if (!data || data.items.length === 0) {
    return <p className="text-gray-500">No reviews yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {data.items.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </ul>
  );
}
