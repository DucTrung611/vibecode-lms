import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/get-error-message';
import { reviewService } from '../services/review.service';
import type { CreateReviewPayload } from '../types/review.types';

export function useCreateReview(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) =>
      reviewService.create(courseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', courseId] });
      toast.success('Review posted');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not post your review'));
    },
  });
}
