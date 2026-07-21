import { ChatController } from '../controllers/chat.controller';
import { ChatService } from '../services/chat.service';

describe('ChatController', () => {
  let controller: ChatController;
  let chatService: jest.Mocked<
    Pick<ChatService, 'createSession' | 'getSession' | 'sendMessage'>
  >;

  beforeEach(() => {
    chatService = {
      createSession: jest.fn(),
      getSession: jest.fn(),
      sendMessage: jest.fn(),
    };
    controller = new ChatController(chatService as unknown as ChatService);
  });

  describe('create', () => {
    it('delegates to chatService.createSession with the current student and body', async () => {
      chatService.createSession.mockResolvedValue({
        id: 'session_1',
      } as never);

      const result = await controller.create('student_1', {
        courseId: 'course_1',
      });

      expect(chatService.createSession).toHaveBeenCalledWith('student_1', {
        courseId: 'course_1',
      });
      expect(result).toEqual({ id: 'session_1' });
    });
  });

  describe('findOne', () => {
    it('delegates to chatService.getSession with the current student and session id', async () => {
      chatService.getSession.mockResolvedValue({ id: 'session_1' } as never);

      const result = await controller.findOne('student_1', 'session_1');

      expect(chatService.getSession).toHaveBeenCalledWith(
        'student_1',
        'session_1',
      );
      expect(result).toEqual({ id: 'session_1' });
    });
  });

  describe('sendMessage', () => {
    it('delegates to chatService.sendMessage with the current student, session id, and body', async () => {
      chatService.sendMessage.mockResolvedValue({
        messageId: 'msg_1',
        role: 'ASSISTANT',
        content: 'Hi there',
        sourcesUsed: [],
      });

      const result = await controller.sendMessage('student_1', 'session_1', {
        content: 'hi',
      });

      expect(chatService.sendMessage).toHaveBeenCalledWith(
        'student_1',
        'session_1',
        { content: 'hi' },
      );
      expect(result).toEqual({
        messageId: 'msg_1',
        role: 'ASSISTANT',
        content: 'Hi there',
        sourcesUsed: [],
      });
    });
  });
});
