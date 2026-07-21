import { ChatMessage } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { ChatMessageRepository } from '../repositories/chat-message.repository';

describe('ChatMessageRepository', () => {
  let repository: ChatMessageRepository;
  let prisma: {
    chatMessage: {
      create: jest.Mock;
    };
  };

  const fakeMessage = { id: 'msg_1' } as ChatMessage;

  beforeEach(() => {
    prisma = {
      chatMessage: {
        create: jest.fn(),
      },
    };
    repository = new ChatMessageRepository(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('passes data straight through to prisma', async () => {
      prisma.chatMessage.create.mockResolvedValue(fakeMessage);
      const data = {
        sessionId: 'session_1',
        role: 'USER' as const,
        content: 'Hello',
      };

      const result = await repository.create(data);

      expect(prisma.chatMessage.create).toHaveBeenCalledWith({ data });
      expect(result).toBe(fakeMessage);
    });
  });
});
