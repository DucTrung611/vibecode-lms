import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/shared/stores/auth.store';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { chatService } from '../services/chat.service';
import { useChatSession } from '../hooks/useChatSession';

vi.mock('../services/chat.service', () => ({
  chatService: { getSession: vi.fn() },
}));

describe('useChatSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearSession();
  });

  it('fetches the session when authenticated and a sessionId is given', async () => {
    useAuthStore.setState({ accessToken: 'access-token' });
    vi.mocked(chatService.getSession).mockResolvedValue({
      id: 'session_1',
      messages: [],
    } as never);

    const { result } = renderHook(() => useChatSession('session_1'), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(chatService.getSession).toHaveBeenCalledWith('session_1');
  });

  it('does not fetch when there is no sessionId', () => {
    useAuthStore.setState({ accessToken: 'access-token' });

    const { result } = renderHook(() => useChatSession(undefined), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(chatService.getSession).not.toHaveBeenCalled();
  });

  it('does not fetch when there is no access token', () => {
    const { result } = renderHook(() => useChatSession('session_1'), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(chatService.getSession).not.toHaveBeenCalled();
  });
});
