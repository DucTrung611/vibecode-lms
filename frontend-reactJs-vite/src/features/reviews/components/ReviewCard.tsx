import { StarRating } from './StarRating';
import type { Review } from '../types/review.types';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <li className="rounded-card border border-slate-200 bg-white p-4 shadow-card transition-shadow dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-slate-900 dark:text-slate-100">
          {review.student?.fullName ?? 'Anonymous'}
        </p>
        <StarRating rating={review.rating} />
      </div>
      {review.comment ? (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {review.comment}
        </p>
      ) : null}
      <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
        {new Date(review.createdAt).toLocaleDateString()}
      </p>
    </li>
  );
}
