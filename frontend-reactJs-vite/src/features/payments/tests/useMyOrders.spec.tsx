import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/shared/stores/auth.store';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { paymentService } from '../services/payment.service';
import { useMyOrders } from '../hooks/useMyOrders';

vi.mock('../services/payment.service', () => ({
  paymentService: { listMine: vi.fn() },
}));

describe('useMyOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearSession();
  });

  it('fetches the order list with page/limit when authenticated', async () => {
    useAuthStore.setState({ accessToken: 'access-token' });
    const items = [{ id: 'order_1' }];
    const meta = { page: 1, limit: 20, total: 1 };
    vi.mocked(paymentService.listMine).mockResolvedValue({
      items,
      meta,
    } as never);

    const { result } = renderHook(() => useMyOrders(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(paymentService.listMine).toHaveBeenCalledWith(1, 20);
    expect(result.current.data).toEqual({ items, meta });
  });

  it('does not fetch when there is no access token', () => {
    const { result } = renderHook(() => useMyOrders(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(paymentService.listMine).not.toHaveBeenCalled();
  });
});
