import { act, renderHook, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { coursesService } from '../services/courses.service';
import { useUpdateCourse } from '../hooks/useUpdateCourse';

vi.mock('../services/courses.service', () => ({
  coursesService: { update: vi.fn() },
}));
vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

describe('useUpdateCourse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const formValues = {
    title: 'Updated title',
    description: 'desc',
    price: 20,
    level: 'INTERMEDIATE' as const,
    status: 'PUBLISHED' as const,
    thumbnailUrl: '',
  };

  it('updates the course, syncs the cache, and toasts success', async () => {
    const updatedCourse = { id: 'course_1', title: 'Updated title' };
    vi.mocked(coursesService.update).mockResolvedValue(updatedCourse as never);

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useUpdateCourse('course_1'), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate(formValues);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(coursesService.update).toHaveBeenCalledWith('course_1', {
      ...formValues,
      thumbnailUrl: undefined,
    });
    expect(queryClient.getQueryData(['courses', 'course_1'])).toEqual(
      updatedCourse,
    );
    expect(toast.success).toHaveBeenCalledTimes(1);
  });

  it('toasts an error on failure', async () => {
    vi.mocked(coursesService.update).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useUpdateCourse('course_1'), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate(formValues);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledTimes(1);
  });
});
