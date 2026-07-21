import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/get-error-message';
import { chatService } from '../services/chat.service';

export function useCreateChatSession() {
  return useMutation({
    mutationFn: (courseId?: string) => chatService.createSession(courseId),
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not start a chat session'));
    },
  });
}
