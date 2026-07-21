import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/get-error-message';
import { enrollmentService } from '../services/enrollment.service';
import type { UpdateProgressPayload } from '../types/enrollment.types';

export function useUpdateProgress(enrollmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProgressPayload) =>
      enrollmentService.updateProgress(enrollmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments', 'me'] });
      toast.success('Progress saved');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not save progress'));
    },
  });
}
