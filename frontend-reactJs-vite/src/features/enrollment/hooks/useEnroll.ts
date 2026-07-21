import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/get-error-message';
import { enrollmentService } from '../services/enrollment.service';

export function useEnroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => enrollmentService.enroll(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments', 'me'] });
      toast.success('Enrolled!');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not enroll in this course'));
    },
  });
}
