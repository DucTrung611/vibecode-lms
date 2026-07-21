import { act, renderHook, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { quizService } from '../services/quiz.service';
import { useSubmitAttempt } from '../hooks/useSubmitAttempt';

vi.mock('../services/quiz.service', () => ({
  quizService: { submitAttempt: vi.fn() },
}));
vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

describe('useSubmitAttempt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits the answers and toasts success when passed', async () => {
    vi.mocked(quizService.submitAttempt).mockResolvedValue({
      attemptId: 'att_1',
      score: 100,
      passed: true,
      answers: [{ questionId: 'q_1', isCorrect: true }],
    });

    const { result } = renderHook(() => useSubmitAttempt(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate({
        attemptId: 'att_1',
        payload: { answers: [{ questionId: 'q_1', selectedOptionId: 'opt_1' }] },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(quizService.submitAttempt).toHaveBeenCalledWith('att_1', {
      answers: [{ questionId: 'q_1', selectedOptionId: 'opt_1' }],
    });
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('toasts a failure message (not an error toast) when not passed', async () => {
    vi.mocked(quizService.submitAttempt).mockResolvedValue({
      attemptId: 'att_1',
      score: 20,
      passed: false,
      answers: [{ questionId: 'q_1', isCorrect: false }],
    });

    const { result } = renderHook(() => useSubmitAttempt(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate({ attemptId: 'att_1', payload: { answers: [] } });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(toast.error).toHaveBeenCalledWith('Score: 20%. Try again!');
  });

  it('toasts an error on request failure', async () => {
    vi.mocked(quizService.submitAttempt).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useSubmitAttempt(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate({ attemptId: 'att_1', payload: { answers: [] } });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledTimes(1);
  });
});
