import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics.service';

export function useInstructorOverview() {
  return useQuery({
    queryKey: ['instructor-analytics-overview'],
    queryFn: () => analyticsService.getOverview(),
    staleTime: 30_000,
  });
}
