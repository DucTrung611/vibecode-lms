import { act, renderHook, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { discussionService } from '../services/discussion.service';
import { useCreateLessonAnswer } from '../hooks/useCreateLessonAnswer';

vi.mock('../services/discussion.service', () => ({
  discussionService: { createAnswer: vi.fn() },
}));
vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

describe('useCreateLessonAnswer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('posts the answer, invalidates the lesson questions list, and toasts success', async () => {
    vi.mocked(discussionService.createAnswer).mockResolvedValue({
      id: 'answer_1',
    } as never);

    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateLessonAnswer('lesson_1'), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({
        questionId: 'question_1',
        payload: { content: 'Here is how.' },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(discussionService.createAnswer).toHaveBeenCalledWith('question_1', {
      content: 'Here is how.',
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['lesson-questions', 'lesson_1'],
    });
    expect(toast.success).toHaveBeenCalledTimes(1);
  });

  it('toasts an error on failure (e.g. not enrolled or not the owner)', async () => {
    vi.mocked(discussionService.createAnswer).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useCreateLessonAnswer('lesson_1'), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate({
        questionId: 'question_1',
        payload: { content: 'Here is how.' },
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledTimes(1);
  });
});
