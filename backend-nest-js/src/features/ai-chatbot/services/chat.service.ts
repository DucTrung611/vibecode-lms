import { Injectable, Logger } from '@nestjs/common';
import { DocumentChunk } from '@prisma/client';
import { AiClientService } from '../../../core/ai/ai-client.service';
import { ApiException } from '../../../shared/types/api-error-code.type';
import { CoursesService } from '../../courses/services/courses.service';
import { CreateChatSessionDto } from '../dto/create-chat-session.dto';
import { SendMessageDto } from '../dto/send-message.dto';
import { ChatSessionEntity } from '../entities/chat-session.entity';
import { ChatMessageRepository } from '../repositories/chat-message.repository';
import { ChatSessionRepository } from '../repositories/chat-session.repository';
import { DocumentChunkRepository } from '../repositories/document-chunk.repository';
import { buildAssistantReply } from '../utils/reply.util';
import { retrieveRelevantChunks } from '../utils/retrieval.util';

export interface SendMessageResult {
  messageId: string;
  role: string;
  content: string;
  sourcesUsed: string[];
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly sessionRepository: ChatSessionRepository,
    private readonly messageRepository: ChatMessageRepository,
    private readonly documentChunkRepository: DocumentChunkRepository,
    private readonly coursesService: CoursesService,
    private readonly aiClient: AiClientService,
  ) {}

  async createSession(
    studentId: string,
    dto: CreateChatSessionDto,
  ): Promise<ChatSessionEntity> {
    if (dto.courseId) {
      await this.coursesService.findById(dto.courseId);
    }

    const session = await this.sessionRepository.create({
      studentId,
      courseId: dto.courseId,
    });

    this.logger.log(`Student ${studentId} started chat session ${session.id}`);
    return ChatSessionEntity.fromPrisma(session);
  }

  async getSession(
    studentId: string,
    sessionId: string,
  ): Promise<ChatSessionEntity> {
    const session =
      await this.sessionRepository.findByIdWithMessages(sessionId);
    if (!session) {
      throw new ApiException(404, 'CHAT_001', 'Chat session not found');
    }
    if (session.studentId !== studentId) {
      throw new ApiException(
        403,
        'AUTH_003',
        'This chat session does not belong to you',
      );
    }

    return ChatSessionEntity.fromPrisma(session);
  }

  async sendMessage(
    studentId: string,
    sessionId: string,
    dto: SendMessageDto,
  ): Promise<SendMessageResult> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new ApiException(404, 'CHAT_001', 'Chat session not found');
    }
    if (session.studentId !== studentId) {
      throw new ApiException(
        403,
        'AUTH_003',
        'This chat session does not belong to you',
      );
    }

    await this.messageRepository.create({
      sessionId,
      role: 'USER',
      content: dto.content,
    });

    const chunks = session.courseId
      ? retrieveRelevantChunks(
          await this.documentChunkRepository.findByCourseId(session.courseId),
          dto.content,
        )
      : [];

    const assistantMessage = await this.messageRepository.create({
      sessionId,
      role: 'ASSISTANT',
      content: await this.generateReply(dto.content, chunks),
    });

    this.logger.log(
      `Replied to student ${studentId} in chat session ${sessionId}`,
    );

    return {
      messageId: assistantMessage.id,
      role: assistantMessage.role,
      content: assistantMessage.content,
      sourcesUsed: chunks.map((chunk) => chunk.id),
    };
  }

  private async generateReply(
    userMessage: string,
    chunks: DocumentChunk[],
  ): Promise<string> {
    if (!this.aiClient.isConfigured()) {
      return buildAssistantReply(chunks);
    }

    try {
      const context = chunks.map((chunk) => chunk.content).join('\n\n');
      const systemPrompt = context
        ? `You are a helpful course assistant. Answer using only this course material when relevant; if it doesn't cover the question, say so.\n\n${context}`
        : 'You are a helpful course assistant.';

      return await this.aiClient.complete([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ]);
    } catch (error) {
      this.logger.error(
        'AI completion failed, falling back to keyword-retrieval reply',
        error instanceof Error ? error.stack : String(error),
      );
      return buildAssistantReply(chunks);
    }
  }
}
