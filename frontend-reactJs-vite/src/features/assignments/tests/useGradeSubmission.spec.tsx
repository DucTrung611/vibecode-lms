import { act, renderHook, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { assignmentService } from '../services/assignment.service';
import { useGradeSubmission } from '../hooks/useGradeSubmission';

vi.mock('../services/assignment.service', () => ({
  assignmentService: { gradeSubmission: vi.fn() },
}));
vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

describe('useGradeSubmission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('grades the submission and toasts success', async () => {
    vi.mocked(assignmentService.gradeSubmission).mockResolvedValue({
      id: 'sub_1',
      score: 90,
    } as never);

    const { result } = renderHook(() => useGradeSubmission('sub_1'), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate({ score: 90, feedback: 'Nice' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(assignmentService.gradeSubmission).toHaveBeenCalledWith('sub_1', {
      score: 90,
      feedback: 'Nice',
    });
    expect(toast.success).toHaveBeenCalledTimes(1);
  });

  it('toasts an error on failure (e.g. not the owning instructor)', async () => {
    vi.mocked(assignmentService.gradeSubmission).mockRejectedValue(
      new Error('boom'),
    );

    const { result } = renderHook(() => useGradeSubmission('sub_1'), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate({ score: 90 });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledTimes(1);
  });
});
