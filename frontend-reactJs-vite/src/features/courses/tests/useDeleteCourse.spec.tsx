import { act, renderHook, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { coursesService } from '../services/courses.service';
import { useDeleteCourse } from '../hooks/useDeleteCourse';

vi.mock('../services/courses.service', () => ({
  coursesService: { remove: vi.fn() },
}));
vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('useDeleteCourse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('removes the course cache entry and navigates to the catalog on success', async () => {
    vi.mocked(coursesService.remove).mockResolvedValue(undefined as never);

    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['courses', 'course_1'], { id: 'course_1' });

    const { result } = renderHook(() => useDeleteCourse(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate('course_1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(coursesService.remove).toHaveBeenCalledWith('course_1');
    expect(queryClient.getQueryData(['courses', 'course_1'])).toBeUndefined();
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/courses', { replace: true });
  });

  it('toasts an error and does not navigate on failure', async () => {
    vi.mocked(coursesService.remove).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useDeleteCourse(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate('course_1');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
