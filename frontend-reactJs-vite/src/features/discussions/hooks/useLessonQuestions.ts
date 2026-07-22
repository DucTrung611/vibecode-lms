import { useQuery } from '@tanstack/react-query';
import { discussionService } from '../services/discussion.service';

export function useLessonQuestions(lessonId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['lesson-questions', lessonId, { page, limit }],
    queryFn: () => discussionService.listByLesson(lessonId, page, limit),
    staleTime: 30_000,
  });
}
