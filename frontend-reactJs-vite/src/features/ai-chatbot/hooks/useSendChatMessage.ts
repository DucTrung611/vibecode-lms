import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/get-error-message';
import { chatService } from '../services/chat.service';

export function useSendChatMessage(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => chatService.sendMessage(sessionId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-session', sessionId] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not send your message'));
    },
  });
}
