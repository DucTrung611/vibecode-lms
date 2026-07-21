import { api, unwrap } from '@/shared/services/api';
import type { ApiSuccess } from '@/shared/types/api.types';
import type { ChatSession, SendMessageResult } from '../types/chat.types';

export const chatService = {
  createSession: (courseId?: string) =>
    api
      .post<ApiSuccess<ChatSession>>(
        '/chat/sessions',
        courseId ? { courseId } : {},
      )
      .then(unwrap),

  getSession: (id: string) =>
    api.get<ApiSuccess<ChatSession>>(`/chat/sessions/${id}`).then(unwrap),

  sendMessage: (id: string, content: string) =>
    api
      .post<ApiSuccess<SendMessageResult>>(`/chat/sessions/${id}/messages`, {
        content,
      })
      .then(unwrap),
};
