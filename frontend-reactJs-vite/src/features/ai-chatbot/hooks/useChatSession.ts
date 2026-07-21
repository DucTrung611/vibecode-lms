import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/stores/auth.store';
import { chatService } from '../services/chat.service';

export function useChatSession(sessionId: string | undefined) {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ['chat-session', sessionId],
    queryFn: () => chatService.getSession(sessionId!),
    enabled: !!accessToken && Boolean(sessionId),
  });
}
