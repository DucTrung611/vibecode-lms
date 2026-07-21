import { ChatMessage } from '@prisma/client';

export class ChatMessageEntity {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  tokensUsed: number | null;
  createdAt: Date;

  static fromPrisma(message: ChatMessage): ChatMessageEntity {
    const entity = new ChatMessageEntity();
    entity.id = message.id;
    entity.sessionId = message.sessionId;
    entity.role = message.role;
    entity.content = message.content;
    entity.tokensUsed = message.tokensUsed;
    entity.createdAt = message.createdAt;
    return entity;
  }
}
