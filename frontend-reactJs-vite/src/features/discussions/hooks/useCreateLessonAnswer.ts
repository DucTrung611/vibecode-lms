import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/get-error-message';
import { discussionService } from '../services/discussion.service';
import type { CreateAnswerPayload } from '../types/discussion.types';

export function useCreateLessonAnswer(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      questionId,
      payload,
    }: {
      questionId: string;
      payload: CreateAnswerPayload;
    }) => discussionService.createAnswer(questionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-questions', lessonId] });
      toast.success('Answer posted');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not post your answer')),
  });
}
