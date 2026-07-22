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
        <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Your rating
        </span>
        <div className="mt-1.5">
          <Controller
            control={control}
            name="rating"
            render={({ field }) => (
              <StarRating rating={field.value} onChange={field.onChange} />
            )}
          />
        </div>
        {errors.rating && (
          <p className="mt-1 text-sm text-danger-600 dark:text-danger-500">
            {errors.rating.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="comment"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Comment (optional)
        </label>
        <textarea
          id="comment"
          rows={3}
          className="mt-1.5 w-full rounded-control border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          {...register('comment')}
        />
      </div>

      <Button type="submit" loading={isPending} disabled={isPending}>
        {isPending ? 'Posting…' : 'Post review'}
      </Button>
    </form>
  );
}
