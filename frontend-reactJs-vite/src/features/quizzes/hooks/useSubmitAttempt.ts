import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/get-error-message';
import { quizService } from '../services/quiz.service';
import type { SubmitAttemptPayload } from '../types/quiz.types';

interface SubmitAttemptArgs {
  attemptId: string;
  payload: SubmitAttemptPayload;
}

export function useSubmitAttempt() {
  return useMutation({
    mutationFn: ({ attemptId, payload }: SubmitAttemptArgs) =>
      quizService.submitAttempt(attemptId, payload),
    onSuccess: (result) => {
      if (result.passed) {
        toast.success(`Passed with a score of ${result.score}%!`);
      } else {
        toast.error(`Score: ${result.score}%. Try again!`);
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not submit your answers'));
    },
  });
}
