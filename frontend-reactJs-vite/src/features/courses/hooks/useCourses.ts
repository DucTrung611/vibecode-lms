import { useQuery } from '@tanstack/react-query';
import { coursesService } from '../services/courses.service';
import type { CourseListFilters } from '../types/courses.types';

export function useCourses(filters: CourseListFilters) {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: () => coursesService.list(filters),
    staleTime: 30_000,
  });
}
