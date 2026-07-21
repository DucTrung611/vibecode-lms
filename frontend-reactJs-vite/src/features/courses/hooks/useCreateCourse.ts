import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '@/shared/utils/get-error-message';
import { coursesService } from '../services/courses.service';
import type { UpdateCourseFormValues } from '../types/courses.types';

export function useCreateCourse() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (dto: UpdateCourseFormValues) =>
      coursesService.create({
        title: dto.title,
        description: dto.description,
        price: dto.price,
        level: dto.level,
        thumbnailUrl: dto.thumbnailUrl || undefined,
      }),
    onSuccess: (course) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course created');
      navigate(`/instructor/courses/${course.id}/edit`, { replace: true });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not create course'));
    },
  });
}
