import { act, renderHook, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { enrollmentService } from '../services/enrollment.service';
import { useUpdateProgress } from '../hooks/useUpdateProgress';

vi.mock('../services/enrollment.service', () => ({
  enrollmentService: { updateProgress: vi.fn() },
}));
vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

describe('useUpdateProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saves progress, invalidates the enrollments list, and toasts success', async () => {
    vi.mocked(enrollmentService.updateProgress).mockResolvedValue({
      id: 'progress_1',
    } as never);

    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateProgress('enr_1'), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({ lessonId: 'lesson_1', status: 'COMPLETED' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(enrollmentService.updateProgress).toHaveBeenCalledWith('enr_1', {
      lessonId: 'lesson_1',
      status: 'COMPLETED',
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['enrollments', 'me'],
    });
    expect(toast.success).toHaveBeenCalledTimes(1);
  });

  it('toasts an error on failure', async () => {
    vi.mocked(enrollmentService.updateProgress).mockRejectedValue(
      new Error('boom'),
    );

    const { result } = renderHook(() => useUpdateProgress('enr_1'), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate({ lessonId: 'lesson_1' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledTimes(1);
  });
});
