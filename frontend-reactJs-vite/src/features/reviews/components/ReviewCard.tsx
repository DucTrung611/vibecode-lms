import { StarRating } from './StarRating';
import type { Review } from '../types/review.types';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <li className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <p className="font-medium text-gray-900">
          {review.student?.fullName ?? 'Anonymous'}
        </p>
        <StarRating rating={review.rating} />
      </div>
      {review.comment ? (
        <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
      ) : null}
      <p className="mt-2 text-xs text-gray-400">
        {new Date(review.createdAt).toLocaleDateString()}
      </p>
    </li>
  );
}
