import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/shared/components/Button';
import { StarRating } from './StarRating';
import {
  reviewFormSchema,
  type ReviewFormValues,
} from '../types/review.types';

interface ReviewFormProps {
  isPending: boolean;
  onSubmit: (values: ReviewFormValues) => void;
}

export function ReviewForm({ isPending, onSubmit }: ReviewFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: { rating: 0, comment: '' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <span className="block text-sm font-medium text-gray-700">
          Your rating
        </span>
        <Controller
          control={control}
          name="rating"
          render={({ field }) => (
            <StarRating rating={field.value} onChange={field.onChange} />
          )}
        />
        {errors.rating && (
          <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
          Comment (optional)
        </label>
        <textarea
          id="comment"
          rows={3}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          {...register('comment')}
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Posting…' : 'Post review'}
      </Button>
    </form>
  );
}
