import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/shared/stores/auth.store';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { assignmentService } from '../services/assignment.service';
import { useAssignment } from '../hooks/useAssignment';

vi.mock('../services/assignment.service', () => ({
  assignmentService: { getById: vi.fn() },
}));

describe('useAssignment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearSession();
  });

  it('fetches the assignment by id when authenticated', async () => {
    useAuthStore.setState({ accessToken: 'access-token' });
    vi.mocked(assignmentService.getById).mockResolvedValue({
      id: 'asg_1',
    } as never);

    const { result } = renderHook(() => useAssignment('asg_1'), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(assignmentService.getById).toHaveBeenCalledWith('asg_1');
    expect(result.current.data).toEqual({ id: 'asg_1' });
  });

  it('does not fetch when there is no access token', () => {
    const { result } = renderHook(() => useAssignment('asg_1'), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(assignmentService.getById).not.toHaveBeenCalled();
  });

  it('does not fetch when id is undefined', () => {
    useAuthStore.setState({ accessToken: 'access-token' });

    const { result } = renderHook(() => useAssignment(undefined), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(assignmentService.getById).not.toHaveBeenCalled();
  });
});
