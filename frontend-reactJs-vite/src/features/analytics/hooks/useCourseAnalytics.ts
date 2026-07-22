import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics.service';

export function useCourseAnalytics(courseId: string) {
  return useQuery({
    queryKey: ['course-analytics', courseId],
    queryFn: () => analyticsService.getCourseAnalytics(courseId),
    staleTime: 30_000,
  });
}
