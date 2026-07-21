import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/stores/auth.store';
import { quizService } from '../services/quiz.service';

export function useQuiz(id: string | undefined) {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ['quiz', id],
    queryFn: () => quizService.getById(id!),
    enabled: Boolean(id) && Boolean(accessToken),
    staleTime: 30_000,
  });
}
