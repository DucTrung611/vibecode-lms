import { Injectable } from '@nestjs/common';
import { ChatMessage, ChatRole } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';

export interface CreateChatMessageData {
  sessionId: string;
  role: ChatRole;
  content: string;
  tokensUsed?: number;
}

@Injectable()
export class ChatMessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateChatMessageData): Promise<ChatMessage> {
    return this.prisma.chatMessage.create({ data });
  }
}
