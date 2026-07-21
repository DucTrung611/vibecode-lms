import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/get-error-message';
import { coursesService } from '../services/courses.service';
import type { ModuleFormValues } from '../types/courses.types';

export function useAddModule(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: ModuleFormValues) =>
      coursesService.addModule(courseId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
      toast.success('Module added');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not add module'));
    },
  });
}
