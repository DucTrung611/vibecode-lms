import { act, renderHook, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { coursesService } from '../services/courses.service';
import { useUpdateLesson } from '../hooks/useUpdateLesson';

vi.mock('../services/courses.service', () => ({
  coursesService: { updateLesson: vi.fn() },
}));
vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

describe('useUpdateLesson', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('strips a blank videoUrl, invalidates the course detail query, and toasts success', async () => {
    vi.mocked(coursesService.updateLesson).mockResolvedValue({
      id: 'lesson_1',
    } as never);

    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateLesson('course_1'), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({
        lessonId: 'lesson_1',
        dto: { title: 'Updated', type: 'VIDEO', videoUrl: '' },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(coursesService.updateLesson).toHaveBeenCalledWith('lesson_1', {
      title: 'Updated',
      type: 'VIDEO',
      videoUrl: undefined,
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['courses', 'course_1'],
    });
    expect(toast.success).toHaveBeenCalledTimes(1);
  });

  it('toasts an error on failure', async () => {
    vi.mocked(coursesService.updateLesson).mockRejectedValue(
      new Error('boom'),
    );

    const { result } = renderHook(() => useUpdateLesson('course_1'), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate({
        lessonId: 'lesson_1',
        dto: { title: 'Updated', type: 'VIDEO' },
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledTimes(1);
  });
});
