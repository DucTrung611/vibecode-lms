import { act, renderHook, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/shared/stores/auth.store';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { identityService } from '../services/identity.service';
import { useLogin } from '../hooks/useLogin';

vi.mock('../services/identity.service', () => ({
  identityService: { login: vi.fn() },
}));
vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearSession();
  });

  it('stores the session and navigates home on success', async () => {
    const user = {
      id: 'u1',
      email: 'a@b.com',
      fullName: 'A B',
      role: 'STUDENT' as const,
    };
    vi.mocked(identityService.login).mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user,
    });

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate({ email: 'a@b.com', password: 'password123' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(useAuthStore.getState().accessToken).toBe('access-token');
    expect(useAuthStore.getState().refreshToken).toBe('refresh-token');
    expect(useAuthStore.getState().user).toEqual(user);
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('shows a toast and leaves the session empty on failure', async () => {
    vi.mocked(identityService.login).mockRejectedValue(new Error('bad creds'));

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate({ email: 'a@b.com', password: 'wrongpass' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
