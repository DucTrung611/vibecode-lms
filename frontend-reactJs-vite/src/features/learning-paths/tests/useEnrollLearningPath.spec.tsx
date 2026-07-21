import { act, renderHook, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { learningPathService } from '../services/learning-path.service';
import { useEnrollLearningPath } from '../hooks/useEnrollLearningPath';

vi.mock('../services/learning-path.service', () => ({
  learningPathService: { enroll: vi.fn() },
}));
vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

describe('useEnrollLearningPath', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enrolls, invalidates the learning paths list, and toasts success', async () => {
    vi.mocked(learningPathService.enroll).mockResolvedValue({
      id: 'lpe_1',
    } as never);

    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useEnrollLearningPath(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate('path_1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(learningPathService.enroll).toHaveBeenCalledWith('path_1');
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['learning-paths'],
    });
    expect(toast.success).toHaveBeenCalledTimes(1);
  });

  it('toasts an error on failure (e.g. already enrolled)', async () => {
    vi.mocked(learningPathService.enroll).mockRejectedValue(
      new Error('boom'),
    );

    const { result } = renderHook(() => useEnrollLearningPath(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate('path_1');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledTimes(1);
  });
});
