import { ChatSession } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { ChatSessionRepository } from '../repositories/chat-session.repository';

describe('ChatSessionRepository', () => {
  let repository: ChatSessionRepository;
  let prisma: {
    chatSession: {
      create: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  const fakeSession = { id: 'session_1' } as ChatSession;

  beforeEach(() => {
    prisma = {
      chatSession: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    repository = new ChatSessionRepository(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('passes data straight through to prisma', async () => {
      prisma.chatSession.create.mockResolvedValue(fakeSession);
      const data = { studentId: 'student_1', courseId: 'course_1' };

      const result = await repository.create(data);

      expect(prisma.chatSession.create).toHaveBeenCalledWith({ data });
      expect(result).toBe(fakeSession);
    });
  });

  describe('findById', () => {
    it('queries by id without messages', async () => {
      prisma.chatSession.findUnique.mockResolvedValue(fakeSession);

      const result = await repository.findById('session_1');

      expect(prisma.chatSession.findUnique).toHaveBeenCalledWith({
        where: { id: 'session_1' },
      });
      expect(result).toBe(fakeSession);
    });
  });

  describe('findByIdWithMessages', () => {
    it('queries by id including messages ordered oldest first', async () => {
      prisma.chatSession.findUnique.mockResolvedValue(fakeSession);

      const result = await repository.findByIdWithMessages('session_1');

      expect(prisma.chatSession.findUnique).toHaveBeenCalledWith({
        where: { id: 'session_1' },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
      expect(result).toBe(fakeSession);
    });
  });
});
