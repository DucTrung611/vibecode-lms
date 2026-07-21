import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/shared/stores/auth.store';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { notificationService } from '../services/notification.service';
import { useNotifications } from '../hooks/useNotifications';

vi.mock('../services/notification.service', () => ({
  notificationService: { listMine: vi.fn() },
}));

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearSession();
  });

  it('fetches the notification list with page/limit when authenticated', async () => {
    useAuthStore.setState({ accessToken: 'access-token' });
    const items = [{ id: 'notif_1' }];
    const meta = { page: 1, limit: 20, total: 1 };
    vi.mocked(notificationService.listMine).mockResolvedValue({
      items,
      meta,
    } as never);

    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(notificationService.listMine).toHaveBeenCalledWith(1, 20);
    expect(result.current.data).toEqual({ items, meta });
  });

  it('does not fetch when there is no access token', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(notificationService.listMine).not.toHaveBeenCalled();
  });
});
