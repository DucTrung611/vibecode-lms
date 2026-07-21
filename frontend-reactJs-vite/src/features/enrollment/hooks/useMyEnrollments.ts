import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/stores/auth.store';
import { enrollmentService } from '../services/enrollment.service';

export function useMyEnrollments(page = 1, limit = 20) {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ['enrollments', 'me', { page, limit }],
    queryFn: () => enrollmentService.listMine(page, limit),
    enabled: Boolean(accessToken),
    staleTime: 30_000,
  });
}
