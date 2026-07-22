import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/get-error-message';
import { coursesService } from '../services/courses.service';
import type { LessonFormValues } from '../types/courses.types';

interface UpdateLessonArgs {
  lessonId: string;
  dto: LessonFormValues;
}

export function useUpdateLesson(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, dto }: UpdateLessonArgs) =>
      coursesService.updateLesson(lessonId, {
        ...dto,
        videoUrl: dto.videoUrl || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
      toast.success('Lesson updated');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not update lesson'));
    },
  });
}
