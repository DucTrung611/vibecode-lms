import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/get-error-message';
import { quizService } from '../services/quiz.service';
import { useQuizAttemptStore } from '../stores/quiz.store';

export function useStartAttempt() {
  const setAttemptId = useQuizAttemptStore((s) => s.setAttemptId);

  return useMutation({
    mutationFn: (quizId: string) => quizService.startAttempt(quizId),
    onSuccess: (attempt) => {
      setAttemptId(attempt.id);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not start this quiz'));
    },
  });
}
