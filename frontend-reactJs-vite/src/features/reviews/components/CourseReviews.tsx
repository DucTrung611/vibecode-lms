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
    <div className="space-y-8">
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Reviews
        </h2>
        <ReviewList courseId={courseId} />
      </div>

      {user?.role === 'STUDENT' && !createReview.isSuccess ? (
        <div className="rounded-card border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
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
