import { useQuery } from '@tanstack/react-query';
import { reviewService } from '../services/review.service';

export function useCourseReviews(courseId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['reviews', courseId, { page, limit }],
    queryFn: () => reviewService.listByCourse(courseId, page, limit),
    staleTime: 30_000,
  });
}
