import { act, renderHook, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { chatService } from '../services/chat.service';
import { useSendChatMessage } from '../hooks/useSendChatMessage';

vi.mock('../services/chat.service', () => ({
  chatService: { sendMessage: vi.fn() },
}));
vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

describe('useSendChatMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends the message and invalidates the session query', async () => {
    vi.mocked(chatService.sendMessage).mockResolvedValue({
      messageId: 'msg_2',
      role: 'ASSISTANT',
      content: 'Hi there',
      sourcesUsed: [],
    });

    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useSendChatMessage('session_1'), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate('What is a right triangle?');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(chatService.sendMessage).toHaveBeenCalledWith(
      'session_1',
      'What is a right triangle?',
    );
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['chat-session', 'session_1'],
    });
  });

  it('toasts an error on failure', async () => {
    vi.mocked(chatService.sendMessage).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useSendChatMessage('session_1'), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate('hi');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledTimes(1);
  });
});
