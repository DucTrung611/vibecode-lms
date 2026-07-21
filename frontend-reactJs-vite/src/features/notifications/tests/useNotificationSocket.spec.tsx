import { renderHook } from '@testing-library/react';
import toast from 'react-hot-toast';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/shared/stores/auth.store';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { useNotificationSocket } from '../hooks/useNotificationSocket';

const mockSocket = {
  on: vi.fn(),
  disconnect: vi.fn(),
};
const mockIo = vi.fn((...args: unknown[]) => {
  void args;
  return mockSocket;
});

vi.mock('socket.io-client', () => ({
  io: (...args: unknown[]) => mockIo(...args),
}));
vi.mock('react-hot-toast', () => ({
  default: vi.fn(),
}));

describe('useNotificationSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearSession();
  });

  it('does not connect when there is no access token', () => {
    renderHook(() => useNotificationSocket(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    expect(mockIo).not.toHaveBeenCalled();
  });

  it('connects to the /realtime namespace with the access token when authenticated', () => {
    useAuthStore.setState({ accessToken: 'access-token' });

    const { unmount } = renderHook(() => useNotificationSocket(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    expect(mockIo).toHaveBeenCalledWith(
      expect.stringContaining('/realtime'),
      expect.objectContaining({ query: { token: 'access-token' } }),
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      'notification.new',
      expect.any(Function),
    );

    unmount();
    expect(mockSocket.disconnect).toHaveBeenCalledTimes(1);
  });

  it('toasts the title when a notification.new event arrives', () => {
    useAuthStore.setState({ accessToken: 'access-token' });

    renderHook(() => useNotificationSocket(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    const handler = mockSocket.on.mock.calls.find(
      ([event]) => event === 'notification.new',
    )?.[1] as (notification: { title: string }) => void;

    handler({ title: 'New grade posted' });

    expect(toast).toHaveBeenCalledWith('New grade posted');
  });
});
