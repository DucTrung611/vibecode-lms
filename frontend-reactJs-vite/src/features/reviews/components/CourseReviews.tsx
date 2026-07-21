import { useAuthStore } from '@/shared/stores/auth.store';
import { ReviewForm } from './ReviewForm';
import { ReviewList } from './ReviewList';
import { useCreateReview } from '../hooks/useCreateReview';

interface CourseReviewsProps {
  courseId: string;
}

export function CourseReviews({ courseId }: CourseReviewsProps) {
  const user = useAuthStore((s) => s.user);
  const createReview = useCreateReview(courseId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Reviews</h2>
        <ReviewList courseId={courseId} />
      </div>

      {user?.role === 'STUDENT' && !createReview.isSuccess ? (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-900">
            Leave a review
          </h3>
          <ReviewForm
            isPending={createReview.isPending}
            onSubmit={(values) =>
              createReview.mutate({
                rating: values.rating,
                comment: values.comment || undefined,
              })
            }
          />
        </div>
      ) : null}
    </div>
  );
}
