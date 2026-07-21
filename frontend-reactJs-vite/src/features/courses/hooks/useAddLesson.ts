import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/get-error-message';
import { coursesService } from '../services/courses.service';
import type { LessonFormValues } from '../types/courses.types';

interface AddLessonArgs {
  moduleId: string;
  dto: LessonFormValues;
}

export function useAddLesson(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ moduleId, dto }: AddLessonArgs) =>
      coursesService.addLesson(moduleId, {
        ...dto,
        videoUrl: dto.videoUrl || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
      toast.success('Lesson added');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not add lesson'));
    },
  });
}
