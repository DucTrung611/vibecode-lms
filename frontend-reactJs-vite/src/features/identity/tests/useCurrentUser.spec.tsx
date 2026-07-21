import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/shared/stores/auth.store';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { identityService } from '../services/identity.service';
import { useCurrentUser } from '../hooks/useCurrentUser';

vi.mock('../services/identity.service', () => ({
  identityService: { getMe: vi.fn() },
}));

describe('useCurrentUser', () => {
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

  it('fetches the profile and syncs it into the auth store when authenticated', async () => {
    useAuthStore.setState({ accessToken: 'access-token' });
    vi.mocked(identityService.getMe).mockResolvedValue(user);

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(user);
    expect(useAuthStore.getState().user).toEqual(user);
  });

  it('does not call the API when there is no access token', () => {
    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(identityService.getMe).not.toHaveBeenCalled();
  });
});
