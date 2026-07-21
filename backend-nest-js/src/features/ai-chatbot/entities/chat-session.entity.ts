import { ChatMessage, ChatSession } from '@prisma/client';
import { ChatMessageEntity } from './chat-message.entity';

export class ChatSessionEntity {
  id: string;
  studentId: string;
  courseId: string | null;
  title: string | null;
  createdAt: Date;
  messages?: ChatMessageEntity[];

  static fromPrisma(
    session: ChatSession & { messages?: ChatMessage[] },
  ): ChatSessionEntity {
    const entity = new ChatSessionEntity();
    entity.id = session.id;
    entity.studentId = session.studentId;
    entity.courseId = session.courseId;
    entity.title = session.title;
    entity.createdAt = session.createdAt;
    if (session.messages) {
      entity.messages = session.messages.map((message) =>
        ChatMessageEntity.fromPrisma(message),
      );
    }
    return entity;
  }
}
