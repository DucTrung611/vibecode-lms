import { useQuery } from '@tanstack/react-query';
import { instructorsService } from '../services/instructors.service';

export function useInstructorCourses(
  id: string | undefined,
  page: number,
  limit = 12,
) {
  return useQuery({
    queryKey: ['instructor', id, 'courses', page, limit],
    queryFn: () => instructorsService.getCourses(id!, page, limit),
    enabled: Boolean(id),
  });
}
