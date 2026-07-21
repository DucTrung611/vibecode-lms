import { useQuery } from '@tanstack/react-query';
import { learningPathService } from '../services/learning-path.service';

export function useLearningPaths(page = 1, limit = 12) {
  return useQuery({
    queryKey: ['learning-paths', { page, limit }],
    queryFn: () => learningPathService.list(page, limit),
    staleTime: 30_000,
  });
}
