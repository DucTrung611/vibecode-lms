import { Injectable } from '@nestjs/common';
import { ChatSession } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';

export interface CreateChatSessionData {
  studentId: string;
  courseId?: string;
  title?: string;
}

@Injectable()
export class ChatSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateChatSessionData): Promise<ChatSession> {
    return this.prisma.chatSession.create({ data });
  }

  findById(id: string): Promise<ChatSession | null> {
    return this.prisma.chatSession.findUnique({ where: { id } });
  }

  findByIdWithMessages(id: string) {
    return this.prisma.chatSession.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }
}
