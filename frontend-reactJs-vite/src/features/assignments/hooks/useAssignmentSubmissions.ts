import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/stores/auth.store';
import { assignmentService } from '../services/assignment.service';

export function useAssignmentSubmissions(
  assignmentId: string | undefined,
  page = 1,
  limit = 20,
) {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ['assignment', assignmentId, 'submissions', { page, limit }],
    queryFn: () => assignmentService.listSubmissions(assignmentId!, page, limit),
    enabled: Boolean(assignmentId) && Boolean(accessToken),
    staleTime: 30_000,
  });
}
