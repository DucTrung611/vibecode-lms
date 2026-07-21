import { act, renderHook, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { coursesService } from '../services/courses.service';
import { useAddModule } from '../hooks/useAddModule';

vi.mock('../services/courses.service', () => ({
  coursesService: { addModule: vi.fn() },
}));
vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

describe('useAddModule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds the module, invalidates the course detail query, and toasts success', async () => {
    vi.mocked(coursesService.addModule).mockResolvedValue({
      id: 'module_1',
    } as never);

    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useAddModule('course_1'), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({ title: 'Module 1' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(coursesService.addModule).toHaveBeenCalledWith('course_1', {
      title: 'Module 1',
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['courses', 'course_1'],
    });
    expect(toast.success).toHaveBeenCalledTimes(1);
  });

  it('toasts an error on failure', async () => {
    vi.mocked(coursesService.addModule).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useAddModule('course_1'), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate({ title: 'Module 1' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledTimes(1);
  });
});
