import { act, renderHook, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { paymentService } from '../services/payment.service';
import { useBuyCourse } from '../hooks/useBuyCourse';

vi.mock('../services/payment.service', () => ({
  paymentService: { createOrder: vi.fn(), pay: vi.fn() },
}));
vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

describe('useBuyCourse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates an order for the course, pays it, invalidates orders, and toasts success', async () => {
    vi.mocked(paymentService.createOrder).mockResolvedValue({
      id: 'order_1',
    } as never);
    vi.mocked(paymentService.pay).mockResolvedValue({
      id: 'order_1',
      status: 'PAID',
    } as never);

    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useBuyCourse(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate('course_1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(paymentService.createOrder).toHaveBeenCalledWith(['course_1']);
    expect(paymentService.pay).toHaveBeenCalledWith('order_1');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['orders'] });
    expect(toast.success).toHaveBeenCalledTimes(1);
  });

  it('toasts an error when order creation or payment fails', async () => {
    vi.mocked(paymentService.createOrder).mockRejectedValue(
      new Error('boom'),
    );

    const { result } = renderHook(() => useBuyCourse(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate('course_1');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(paymentService.pay).not.toHaveBeenCalled();
  });
});
