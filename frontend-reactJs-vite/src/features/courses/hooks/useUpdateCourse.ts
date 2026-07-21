import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/get-error-message';
import { coursesService } from '../services/courses.service';
import type { UpdateCourseFormValues } from '../types/courses.types';

export function useUpdateCourse(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateCourseFormValues) =>
      coursesService.update(courseId, {
        ...dto,
        thumbnailUrl: dto.thumbnailUrl || undefined,
      }),
    onSuccess: (course) => {
      queryClient.setQueryData(['courses', courseId], course);
      queryClient.invalidateQueries({ queryKey: ['courses'], exact: false });
      toast.success('Course updated');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not update course'));
    },
  });
}
