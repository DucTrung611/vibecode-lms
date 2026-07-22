import { act, renderHook, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { discussionService } from '../services/discussion.service';
import { useCreateLessonQuestion } from '../hooks/useCreateLessonQuestion';

vi.mock('../services/discussion.service', () => ({
  discussionService: { createQuestion: vi.fn() },
}));
vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

describe('useCreateLessonQuestion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('posts the question, invalidates the lesson questions list, and toasts success', async () => {
    vi.mocked(discussionService.createQuestion).mockResolvedValue({
      id: 'question_1',
    } as never);

    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateLessonQuestion('lesson_1'), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({ content: 'How does this work?' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(discussionService.createQuestion).toHaveBeenCalledWith('lesson_1', {
      content: 'How does this work?',
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['lesson-questions', 'lesson_1'],
    });
    expect(toast.success).toHaveBeenCalledTimes(1);
  });

  it('toasts an error on failure (e.g. not enrolled)', async () => {
    vi.mocked(discussionService.createQuestion).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useCreateLessonQuestion('lesson_1'), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate({ content: 'How does this work?' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledTimes(1);
  });
});
