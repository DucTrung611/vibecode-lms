import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/shared/stores/auth.store';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { assignmentService } from '../services/assignment.service';
import { useAssignmentSubmissions } from '../hooks/useAssignmentSubmissions';

vi.mock('../services/assignment.service', () => ({
  assignmentService: { listSubmissions: vi.fn() },
}));

describe('useAssignmentSubmissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearSession();
  });

  it('fetches the submission list with page/limit when authenticated', async () => {
    useAuthStore.setState({ accessToken: 'access-token' });
    const items = [{ id: 'sub_1' }];
    const meta = { page: 1, limit: 20, total: 1 };
    vi.mocked(assignmentService.listSubmissions).mockResolvedValue({
      items,
      meta,
    } as never);

    const { result } = renderHook(() => useAssignmentSubmissions('asg_1'), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(assignmentService.listSubmissions).toHaveBeenCalledWith(
      'asg_1',
      1,
      20,
    );
    expect(result.current.data).toEqual({ items, meta });
  });

  it('does not fetch when there is no assignment id', () => {
    useAuthStore.setState({ accessToken: 'access-token' });

    const { result } = renderHook(() => useAssignmentSubmissions(undefined), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(assignmentService.listSubmissions).not.toHaveBeenCalled();
  });

  it('does not fetch when there is no access token', () => {
    const { result } = renderHook(() => useAssignmentSubmissions('asg_1'), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(assignmentService.listSubmissions).not.toHaveBeenCalled();
  });
});
