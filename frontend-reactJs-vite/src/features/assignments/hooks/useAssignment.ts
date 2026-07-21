import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/stores/auth.store';
import { assignmentService } from '../services/assignment.service';

export function useAssignment(id: string | undefined) {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ['assignment', id],
    queryFn: () => assignmentService.getById(id!),
    enabled: Boolean(id) && Boolean(accessToken),
    staleTime: 30_000,
  });
}
