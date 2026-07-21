import { act, renderHook, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { assignmentService } from '../services/assignment.service';
import { useSubmitAssignment } from '../hooks/useSubmitAssignment';

vi.mock('../services/assignment.service', () => ({
  assignmentService: { submit: vi.fn() },
}));
vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

describe('useSubmitAssignment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits the payload and toasts success', async () => {
    vi.mocked(assignmentService.submit).mockResolvedValue({
      id: 'sub_1',
    } as never);

    const { result } = renderHook(() => useSubmitAssignment('asg_1'), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate({ content: 'my essay' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(assignmentService.submit).toHaveBeenCalledWith('asg_1', {
      content: 'my essay',
    });
    expect(toast.success).toHaveBeenCalledTimes(1);
  });

  it('toasts an error on failure (e.g. already submitted)', async () => {
    vi.mocked(assignmentService.submit).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useSubmitAssignment('asg_1'), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate({ content: 'my essay' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledTimes(1);
  });
});
