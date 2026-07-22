import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/get-error-message';
import { discussionService } from '../services/discussion.service';
import type { CreateQuestionPayload } from '../types/discussion.types';

export function useCreateLessonQuestion(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateQuestionPayload) =>
      discussionService.createQuestion(lessonId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-questions', lessonId] });
      toast.success('Question posted');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not post your question')),
  });
}
