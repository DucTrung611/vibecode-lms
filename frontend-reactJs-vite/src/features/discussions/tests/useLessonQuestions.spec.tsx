import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { discussionService } from '../services/discussion.service';
import { useLessonQuestions } from '../hooks/useLessonQuestions';

vi.mock('../services/discussion.service', () => ({
  discussionService: { listByLesson: vi.fn() },
}));

describe('useLessonQuestions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches the question list for a lesson with default pagination', async () => {
    const items = [{ id: 'question_1' }];
    const meta = { page: 1, limit: 20, total: 1 };
    vi.mocked(discussionService.listByLesson).mockResolvedValue({
      items,
      meta,
    } as never);

    const { result } = renderHook(() => useLessonQuestions('lesson_1'), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(discussionService.listByLesson).toHaveBeenCalledWith('lesson_1', 1, 20);
    expect(result.current.data).toEqual({ items, meta });
  });

  it('forwards explicit page/limit', async () => {
    vi.mocked(discussionService.listByLesson).mockResolvedValue({
      items: [],
      meta: { page: 2, limit: 5, total: 0 },
    } as never);

    renderHook(() => useLessonQuestions('lesson_1', 2, 5), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    await waitFor(() =>
      expect(discussionService.listByLesson).toHaveBeenCalledWith('lesson_1', 2, 5),
    );
  });
});
