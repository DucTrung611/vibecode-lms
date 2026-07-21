import { act, renderHook, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/shared/stores/auth.store';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { identityService } from '../services/identity.service';
import { useUpdateProfile } from '../hooks/useUpdateProfile';

vi.mock('../services/identity.service', () => ({
  identityService: { updateMe: vi.fn() },
}));
vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

describe('useUpdateProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearSession();
  });

  it('syncs the auth store and query cache, and toasts success', async () => {
    const updatedUser = {
      id: 'u1',
      email: 'a@b.com',
      fullName: 'New Name',
      role: 'STUDENT' as const,
    };
    vi.mocked(identityService.updateMe).mockResolvedValue(updatedUser);

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useUpdateProfile(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({ fullName: 'New Name' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(useAuthStore.getState().user).toEqual(updatedUser);
    expect(queryClient.getQueryData(['identity', 'me'])).toEqual(updatedUser);
    expect(toast.success).toHaveBeenCalledTimes(1);
  });

  it('toasts an error on failure without touching the store', async () => {
    vi.mocked(identityService.updateMe).mockRejectedValue(
      new Error('validation failed'),
    );

    const { result } = renderHook(() => useUpdateProfile(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate({ fullName: '' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().user).toBeNull();
  });
});
