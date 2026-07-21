import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/get-error-message';
import { learningPathService } from '../services/learning-path.service';

export function useEnrollLearningPath() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => learningPathService.enroll(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] });
      toast.success('Enrolled in learning path!');
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(error, 'Could not enroll in this learning path'),
      );
    },
  });
}
