import { useQuery } from '@tanstack/react-query';
import { coursesService } from '../services/courses.service';

export function useCourse(id: string | undefined) {
  return useQuery({
    queryKey: ['courses', id],
    queryFn: () => coursesService.getById(id!),
    enabled: Boolean(id),
  });
}
