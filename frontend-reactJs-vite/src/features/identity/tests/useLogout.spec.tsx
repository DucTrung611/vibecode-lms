import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/shared/stores/auth.store';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { identityService } from '../services/identity.service';
import { useLogout } from '../hooks/useLogout';

vi.mock('../services/identity.service', () => ({
  identityService: { logout: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('useLogout', () => {
  const user = {
    id: 'u1',
    email: 'a@b.com',
    fullName: 'A B',
    role: 'STUDENT' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearSession();
  });

  it('revokes the refresh token, clears the session, and navigates to /login', async () => {
    useAuthStore.getState().setSession(user, 'access-token', 'refresh-token');
    vi.mocked(identityService.logout).mockResolvedValue(
      undefined as never,
    );

    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['identity', 'me'], user);

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(identityService.logout).toHaveBeenCalledWith('refresh-token');
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(queryClient.getQueryData(['identity', 'me'])).toBeUndefined();
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('is a no-op network call (still clears session) when there is no refresh token', async () => {
    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(identityService.logout).not.toHaveBeenCalled();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });
});
