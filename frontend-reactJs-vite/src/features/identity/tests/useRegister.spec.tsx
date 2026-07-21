import { act, renderHook, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { identityService } from '../services/identity.service';
import { useRegister } from '../hooks/useRegister';

vi.mock('../services/identity.service', () => ({
  identityService: { register: vi.fn() },
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

describe('useRegister', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const payload = {
    email: 'a@b.com',
    password: 'password123',
    fullName: 'A B',
    role: 'STUDENT' as const,
  };

  it('toasts success and redirects to /login (no auto-login)', async () => {
    vi.mocked(identityService.register).mockResolvedValue({
      id: 'u1',
      email: payload.email,
      fullName: payload.fullName,
      role: payload.role,
    });

    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate(payload);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(identityService.register).toHaveBeenCalledWith(payload);
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('toasts an error on failure and does not navigate', async () => {
    vi.mocked(identityService.register).mockRejectedValue(
      new Error('email taken'),
    );

    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate(payload);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
