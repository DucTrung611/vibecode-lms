import { act, renderHook, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { reviewService } from '../services/review.service';
import { useCreateReview } from '../hooks/useCreateReview';

vi.mock('../services/review.service', () => ({
  reviewService: { create: vi.fn() },
}));
vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

describe('useCreateReview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('posts the review, invalidates the course reviews list, and toasts success', async () => {
    vi.mocked(reviewService.create).mockResolvedValue({
      id: 'rev_1',
    } as never);

    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateReview('course_1'), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({ rating: 5, comment: 'Great course' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(reviewService.create).toHaveBeenCalledWith('course_1', {
      rating: 5,
      comment: 'Great course',
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['reviews', 'course_1'],
    });
    expect(toast.success).toHaveBeenCalledTimes(1);
  });

  it('toasts an error on failure (e.g. already reviewed or not enrolled)', async () => {
    vi.mocked(reviewService.create).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useCreateReview('course_1'), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate({ rating: 5 });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledTimes(1);
  });
});
