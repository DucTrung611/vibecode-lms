import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/shared/stores/auth.store';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { quizService } from '../services/quiz.service';
import { useQuiz } from '../hooks/useQuiz';

vi.mock('../services/quiz.service', () => ({
  quizService: { getById: vi.fn() },
}));

describe('useQuiz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearSession();
  });

  it('fetches the quiz by id when authenticated', async () => {
    useAuthStore.setState({ accessToken: 'access-token' });
    vi.mocked(quizService.getById).mockResolvedValue({ id: 'quiz_1' } as never);

    const { result } = renderHook(() => useQuiz('quiz_1'), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(quizService.getById).toHaveBeenCalledWith('quiz_1');
    expect(result.current.data).toEqual({ id: 'quiz_1' });
  });

  it('does not fetch when there is no access token', () => {
    const { result } = renderHook(() => useQuiz('quiz_1'), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(quizService.getById).not.toHaveBeenCalled();
  });

  it('does not fetch when id is undefined', () => {
    useAuthStore.setState({ accessToken: 'access-token' });

    const { result } = renderHook(() => useQuiz(undefined), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(quizService.getById).not.toHaveBeenCalled();
  });
});
