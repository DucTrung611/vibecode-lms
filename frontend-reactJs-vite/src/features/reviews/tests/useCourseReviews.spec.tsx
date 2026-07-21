import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { reviewService } from '../services/review.service';
import { useCourseReviews } from '../hooks/useCourseReviews';

vi.mock('../services/review.service', () => ({
  reviewService: { listByCourse: vi.fn() },
}));

describe('useCourseReviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches the review list for a course without requiring auth', async () => {
    const items = [{ id: 'rev_1' }];
    const meta = { page: 1, limit: 20, total: 1 };
    vi.mocked(reviewService.listByCourse).mockResolvedValue({
      items,
      meta,
    } as never);

    const { result } = renderHook(() => useCourseReviews('course_1'), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(reviewService.listByCourse).toHaveBeenCalledWith('course_1', 1, 20);
    expect(result.current.data).toEqual({ items, meta });
  });

  it('forwards explicit page/limit', async () => {
    vi.mocked(reviewService.listByCourse).mockResolvedValue({
      items: [],
      meta: { page: 2, limit: 5, total: 0 },
    } as never);

    renderHook(() => useCourseReviews('course_1', 2, 5), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    await waitFor(() =>
      expect(reviewService.listByCourse).toHaveBeenCalledWith(
        'course_1',
        2,
        5,
      ),
    );
  });
});
