import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { coursesService } from '../services/courses.service';
import { useCourses } from '../hooks/useCourses';

vi.mock('../services/courses.service', () => ({
  coursesService: { list: vi.fn() },
}));

describe('useCourses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches the course list with the given filters', async () => {
    const items = [{ id: 'course_1' }];
    const meta = { page: 1, limit: 12, total: 1 };
    vi.mocked(coursesService.list).mockResolvedValue({
      items,
      meta,
    } as never);

    const filters = { page: 1, limit: 12, status: 'PUBLISHED' as const };
    const { result } = renderHook(() => useCourses(filters), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(coursesService.list).toHaveBeenCalledWith(filters);
    expect(result.current.data).toEqual({ items, meta });
  });

  it('surfaces an error state when the request fails', async () => {
    vi.mocked(coursesService.list).mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useCourses({}), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
  });
});
