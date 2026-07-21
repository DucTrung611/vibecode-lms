import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/shared/stores/auth.store';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { enrollmentService } from '../services/enrollment.service';
import { useMyEnrollments } from '../hooks/useMyEnrollments';

vi.mock('../services/enrollment.service', () => ({
  enrollmentService: { listMine: vi.fn() },
}));

describe('useMyEnrollments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearSession();
  });

  it('fetches the enrollment list with page/limit when authenticated', async () => {
    useAuthStore.setState({ accessToken: 'access-token' });
    const items = [{ id: 'enr_1' }];
    const meta = { page: 1, limit: 20, total: 1 };
    vi.mocked(enrollmentService.listMine).mockResolvedValue({
      items,
      meta,
    } as never);

    const { result } = renderHook(() => useMyEnrollments(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(enrollmentService.listMine).toHaveBeenCalledWith(1, 20);
    expect(result.current.data).toEqual({ items, meta });
  });

  it('does not fetch when there is no access token', () => {
    const { result } = renderHook(() => useMyEnrollments(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(enrollmentService.listMine).not.toHaveBeenCalled();
  });
});
