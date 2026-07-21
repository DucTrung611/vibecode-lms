import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { coursesService } from '../services/courses.service';
import { useCourse } from '../hooks/useCourse';

vi.mock('../services/courses.service', () => ({
  coursesService: { getById: vi.fn() },
}));

describe('useCourse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches the course by id when an id is provided', async () => {
    const course = { id: 'course_1', title: 'Intro' };
    vi.mocked(coursesService.getById).mockResolvedValue(course as never);

    const { result } = renderHook(() => useCourse('course_1'), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(coursesService.getById).toHaveBeenCalledWith('course_1');
    expect(result.current.data).toEqual(course);
  });

  it('does not fetch when id is undefined', () => {
    const { result } = renderHook(() => useCourse(undefined), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(coursesService.getById).not.toHaveBeenCalled();
  });
});
