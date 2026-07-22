import { useQuery } from '@tanstack/react-query';
import { instructorsService } from '../services/instructors.service';

export function useInstructorProfile(id: string | undefined) {
  return useQuery({
    queryKey: ['instructor', id],
    queryFn: () => instructorsService.getProfile(id!),
    enabled: Boolean(id),
  });
}
