import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { instructorsService } from '../services/instructors.service';
import { useInstructorCourses } from '../hooks/useInstructorCourses';

vi.mock('../services/instructors.service', () => ({
  instructorsService: { getProfile: vi.fn(), getCourses: vi.fn() },
}));

describe('useInstructorCourses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches the instructor courses page', async () => {
    const page = { items: [], meta: { page: 1, limit: 12, total: 0 } };
    vi.mocked(instructorsService.getCourses).mockResolvedValue(page as never);

    const { result } = renderHook(
      () => useInstructorCourses('instructor_1', 1),
      { wrapper: createWrapper(createTestQueryClient()) },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(instructorsService.getCourses).toHaveBeenCalledWith(
      'instructor_1',
      1,
      12,
    );
    expect(result.current.data).toEqual(page);
  });

  it('does not fetch when id is undefined', () => {
    renderHook(() => useInstructorCourses(undefined, 1), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    expect(instructorsService.getCourses).not.toHaveBeenCalled();
  });
});
