import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '@/shared/utils/get-error-message';
import { coursesService } from '../services/courses.service';

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (courseId: string) => coursesService.remove(courseId),
    onSuccess: (_data, courseId) => {
      queryClient.removeQueries({ queryKey: ['courses', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course deleted');
      navigate('/courses', { replace: true });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not delete course'));
    },
  });
}
