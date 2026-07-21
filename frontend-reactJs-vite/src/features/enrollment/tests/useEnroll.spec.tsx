import { act, renderHook, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { enrollmentService } from '../services/enrollment.service';
import { useEnroll } from '../hooks/useEnroll';

vi.mock('../services/enrollment.service', () => ({
  enrollmentService: { enroll: vi.fn() },
}));
vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

describe('useEnroll', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enrolls, invalidates the enrollments list, and toasts success', async () => {
    vi.mocked(enrollmentService.enroll).mockResolvedValue({
      enrollmentId: 'enr_1',
      status: 'ACTIVE',
    });

    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useEnroll(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate('course_1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(enrollmentService.enroll).toHaveBeenCalledWith('course_1');
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['enrollments', 'me'],
    });
    expect(toast.success).toHaveBeenCalledTimes(1);
  });

  it('toasts an error on failure (e.g. already enrolled)', async () => {
    vi.mocked(enrollmentService.enroll).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useEnroll(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate('course_1');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledTimes(1);
  });
});
