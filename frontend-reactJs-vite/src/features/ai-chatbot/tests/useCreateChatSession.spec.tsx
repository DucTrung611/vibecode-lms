import { act, renderHook, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { chatService } from '../services/chat.service';
import { useCreateChatSession } from '../hooks/useCreateChatSession';

vi.mock('../services/chat.service', () => ({
  chatService: { createSession: vi.fn() },
}));
vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

describe('useCreateChatSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a session, optionally scoped to a course', async () => {
    vi.mocked(chatService.createSession).mockResolvedValue({
      id: 'session_1',
    } as never);

    const { result } = renderHook(() => useCreateChatSession(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate('course_1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(chatService.createSession).toHaveBeenCalledWith('course_1');
  });

  it('toasts an error on failure', async () => {
    vi.mocked(chatService.createSession).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useCreateChatSession(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate(undefined);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledTimes(1);
  });
});
