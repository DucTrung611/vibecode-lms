import { act, renderHook, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { quizService } from '../services/quiz.service';
import { useStartAttempt } from '../hooks/useStartAttempt';
import { useQuizAttemptStore } from '../stores/quiz.store';

vi.mock('../services/quiz.service', () => ({
  quizService: { startAttempt: vi.fn() },
}));
vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

describe('useStartAttempt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQuizAttemptStore.getState().reset();
  });

  it('starts the attempt and stores the attempt id', async () => {
    vi.mocked(quizService.startAttempt).mockResolvedValue({
      id: 'att_1',
      quizId: 'quiz_1',
      studentId: 'student_1',
      score: null,
      startedAt: '2026-01-01T00:00:00.000Z',
      submittedAt: null,
    });

    const { result } = renderHook(() => useStartAttempt(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate('quiz_1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(quizService.startAttempt).toHaveBeenCalledWith('quiz_1');
    expect(useQuizAttemptStore.getState().attemptId).toBe('att_1');
  });

  it('toasts an error on failure', async () => {
    vi.mocked(quizService.startAttempt).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useStartAttempt(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate('quiz_1');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(useQuizAttemptStore.getState().attemptId).toBeNull();
  });
});
