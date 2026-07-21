import { ChatMessage, ChatSession, DocumentChunk } from '@prisma/client';
import { AiClientService } from '../../../core/ai/ai-client.service';
import { CoursesService } from '../../courses/services/courses.service';
import { ApiException } from '../../../shared/types/api-error-code.type';
import { ChatMessageRepository } from '../repositories/chat-message.repository';
import { ChatSessionRepository } from '../repositories/chat-session.repository';
import { DocumentChunkRepository } from '../repositories/document-chunk.repository';
import { ChatService } from '../services/chat.service';

describe('ChatService', () => {
  let service: ChatService;
  let sessionRepository: jest.Mocked<
    Pick<ChatSessionRepository, 'create' | 'findById' | 'findByIdWithMessages'>
  >;
  let messageRepository: jest.Mocked<Pick<ChatMessageRepository, 'create'>>;
  let documentChunkRepository: jest.Mocked<
    Pick<DocumentChunkRepository, 'findByCourseId'>
  >;
  let coursesService: jest.Mocked<Pick<CoursesService, 'findById'>>;
  let aiClient: jest.Mocked<Pick<AiClientService, 'isConfigured' | 'complete'>>;

  const fakeSession: ChatSession = {
    id: 'session_1',
    studentId: 'student_1',
    courseId: 'course_1',
    title: null,
    createdAt: new Date('2026-01-01'),
  };

  const fakeUserMessage: ChatMessage = {
    id: 'msg_1',
    sessionId: 'session_1',
    role: 'USER',
    content: 'What is a right triangle?',
    tokensUsed: null,
    createdAt: new Date('2026-01-01'),
  };

  const fakeAssistantMessage: ChatMessage = {
    id: 'msg_2',
    sessionId: 'session_1',
    role: 'ASSISTANT',
    content:
      'Based on the course material:\n\n- A right triangle has one 90-degree angle.',
    tokensUsed: null,
    createdAt: new Date('2026-01-01'),
  };

  const relevantChunk: DocumentChunk = {
    id: 'chunk_1',
    courseId: 'course_1',
    lessonId: null,
    content: 'A right triangle has one 90-degree angle.',
    embedding: null,
    metadata: null,
    chunkIndex: 0,
  };

  beforeEach(() => {
    sessionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByIdWithMessages: jest.fn(),
    };
    messageRepository = {
      create: jest.fn(),
    };
    documentChunkRepository = {
      findByCourseId: jest.fn(),
    };
    coursesService = {
      findById: jest.fn(),
    };
    aiClient = {
      isConfigured: jest.fn().mockReturnValue(false),
      complete: jest.fn(),
    };

    service = new ChatService(
      sessionRepository as unknown as ChatSessionRepository,
      messageRepository as unknown as ChatMessageRepository,
      documentChunkRepository as unknown as DocumentChunkRepository,
      coursesService as unknown as CoursesService,
      aiClient as unknown as AiClientService,
    );
  });

  describe('createSession', () => {
    it('verifies the course exists when courseId is provided', async () => {
      coursesService.findById.mockResolvedValue({ id: 'course_1' } as never);
      sessionRepository.create.mockResolvedValue(fakeSession);

      const result = await service.createSession('student_1', {
        courseId: 'course_1',
      });

      expect(coursesService.findById).toHaveBeenCalledWith('course_1');
      expect(sessionRepository.create).toHaveBeenCalledWith({
        studentId: 'student_1',
        courseId: 'course_1',
      });
      expect(result.id).toBe('session_1');
    });

    it('propagates COURSE_004 when the course does not exist', async () => {
      coursesService.findById.mockRejectedValue(
        new ApiException(404, 'COURSE_004', 'Course not found'),
      );

      await expect(
        service.createSession('student_1', { courseId: 'missing' }),
      ).rejects.toMatchObject({ httpStatus: 404, code: 'COURSE_004' });
      expect(sessionRepository.create).not.toHaveBeenCalled();
    });

    it('creates a general (unscoped) session without checking a course', async () => {
      sessionRepository.create.mockResolvedValue({
        ...fakeSession,
        courseId: null,
      });

      await service.createSession('student_1', {});

      expect(coursesService.findById).not.toHaveBeenCalled();
      expect(sessionRepository.create).toHaveBeenCalledWith({
        studentId: 'student_1',
        courseId: undefined,
      });
    });
  });

  describe('getSession', () => {
    it('throws CHAT_001 (404) when the session does not exist', async () => {
      sessionRepository.findByIdWithMessages.mockResolvedValue(null);

      await expect(
        service.getSession('student_1', 'missing'),
      ).rejects.toMatchObject({ httpStatus: 404, code: 'CHAT_001' });
    });

    it('throws AUTH_003 (403) when the session belongs to another student', async () => {
      sessionRepository.findByIdWithMessages.mockResolvedValue(fakeSession);

      await expect(
        service.getSession('someone_else', 'session_1'),
      ).rejects.toMatchObject({ httpStatus: 403, code: 'AUTH_003' });
    });

    it('returns the session with its messages', async () => {
      sessionRepository.findByIdWithMessages.mockResolvedValue({
        ...fakeSession,
        messages: [fakeUserMessage, fakeAssistantMessage],
      });

      const result = await service.getSession('student_1', 'session_1');

      expect(result.messages).toHaveLength(2);
    });
  });

  describe('sendMessage', () => {
    it('throws CHAT_001 (404) when the session does not exist', async () => {
      sessionRepository.findById.mockResolvedValue(null);

      await expect(
        service.sendMessage('student_1', 'missing', { content: 'hi' }),
      ).rejects.toMatchObject({ httpStatus: 404, code: 'CHAT_001' });
    });

    it('throws AUTH_003 (403) when the session belongs to another student', async () => {
      sessionRepository.findById.mockResolvedValue(fakeSession);

      await expect(
        service.sendMessage('someone_else', 'session_1', { content: 'hi' }),
      ).rejects.toMatchObject({ httpStatus: 403, code: 'AUTH_003' });
    });

    it('persists the user message, retrieves relevant chunks, and returns the assistant reply', async () => {
      sessionRepository.findById.mockResolvedValue(fakeSession);
      documentChunkRepository.findByCourseId.mockResolvedValue([relevantChunk]);
      messageRepository.create
        .mockResolvedValueOnce(fakeUserMessage)
        .mockResolvedValueOnce(fakeAssistantMessage);

      const result = await service.sendMessage('student_1', 'session_1', {
        content: 'What is a right triangle?',
      });

      expect(messageRepository.create).toHaveBeenNthCalledWith(1, {
        sessionId: 'session_1',
        role: 'USER',
        content: 'What is a right triangle?',
      });
      expect(documentChunkRepository.findByCourseId).toHaveBeenCalledWith(
        'course_1',
      );
      expect(messageRepository.create).toHaveBeenNthCalledWith(2, {
        sessionId: 'session_1',
        role: 'ASSISTANT',
        content: expect.stringContaining('right triangle') as string,
      });
      expect(result).toEqual({
        messageId: 'msg_2',
        role: 'ASSISTANT',
        content: fakeAssistantMessage.content,
        sourcesUsed: ['chunk_1'],
      });
    });

    it('skips retrieval and returns an empty sourcesUsed for a session with no course', async () => {
      sessionRepository.findById.mockResolvedValue({
        ...fakeSession,
        courseId: null,
      });
      messageRepository.create
        .mockResolvedValueOnce(fakeUserMessage)
        .mockResolvedValueOnce({
          ...fakeAssistantMessage,
          content:
            "I don't have specific course material to answer that yet. Try asking a question scoped to a course.",
        });

      const result = await service.sendMessage('student_1', 'session_1', {
        content: 'hi',
      });

      expect(documentChunkRepository.findByCourseId).not.toHaveBeenCalled();
      expect(result.sourcesUsed).toEqual([]);
    });

    it('uses the AI provider for the reply when configured', async () => {
      sessionRepository.findById.mockResolvedValue(fakeSession);
      documentChunkRepository.findByCourseId.mockResolvedValue([relevantChunk]);
      aiClient.isConfigured.mockReturnValue(true);
      aiClient.complete.mockResolvedValue('A right triangle has a 90° angle.');
      messageRepository.create
        .mockResolvedValueOnce(fakeUserMessage)
        .mockResolvedValueOnce({
          ...fakeAssistantMessage,
          content: 'A right triangle has a 90° angle.',
        });

      const result = await service.sendMessage('student_1', 'session_1', {
        content: 'What is a right triangle?',
      });

      expect(aiClient.complete).toHaveBeenCalledWith([
        {
          role: 'system',
          content: expect.stringContaining(
            'A right triangle has one 90-degree angle.',
          ) as string,
        },
        { role: 'user', content: 'What is a right triangle?' },
      ]);
      expect(result.content).toBe('A right triangle has a 90° angle.');
    });

    it('falls back to the keyword-retrieval reply when the AI provider call fails', async () => {
      sessionRepository.findById.mockResolvedValue(fakeSession);
      documentChunkRepository.findByCourseId.mockResolvedValue([relevantChunk]);
      aiClient.isConfigured.mockReturnValue(true);
      aiClient.complete.mockRejectedValue(
        new ApiException(502, 'AI_002', 'AI provider request failed'),
      );
      messageRepository.create
        .mockResolvedValueOnce(fakeUserMessage)
        .mockResolvedValueOnce(fakeAssistantMessage);

      const result = await service.sendMessage('student_1', 'session_1', {
        content: 'What is a right triangle?',
      });

      expect(messageRepository.create).toHaveBeenNthCalledWith(2, {
        sessionId: 'session_1',
        role: 'ASSISTANT',
        content: expect.stringContaining('right triangle') as string,
      });
      expect(result.content).toBe(fakeAssistantMessage.content);
    });
  });
});
