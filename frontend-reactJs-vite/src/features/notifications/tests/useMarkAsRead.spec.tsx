import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { notificationService } from '../services/notification.service';
import { useMarkAsRead } from '../hooks/useMarkAsRead';

vi.mock('../services/notification.service', () => ({
  notificationService: { markAsRead: vi.fn() },
}));

describe('useMarkAsRead', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('marks a notification as read and invalidates the notifications list', async () => {
    vi.mocked(notificationService.markAsRead).mockResolvedValue({
      id: 'notif_1',
      isRead: true,
    } as never);

    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useMarkAsRead(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate('notif_1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(notificationService.markAsRead).toHaveBeenCalledWith('notif_1');
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['notifications'],
    });
  });
});
