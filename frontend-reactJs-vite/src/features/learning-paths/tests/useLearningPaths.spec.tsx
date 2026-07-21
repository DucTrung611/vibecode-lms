import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { learningPathService } from '../services/learning-path.service';
import { useLearningPaths } from '../hooks/useLearningPaths';

vi.mock('../services/learning-path.service', () => ({
  learningPathService: { list: vi.fn() },
}));

describe('useLearningPaths', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches the learning path list without requiring auth', async () => {
    const items = [{ id: 'path_1' }];
    const meta = { page: 1, limit: 12, total: 1 };
    vi.mocked(learningPathService.list).mockResolvedValue({
      items,
      meta,
    } as never);

    const { result } = renderHook(() => useLearningPaths(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(learningPathService.list).toHaveBeenCalledWith(1, 12);
    expect(result.current.data).toEqual({ items, meta });
  });

  it('forwards explicit page/limit', async () => {
    vi.mocked(learningPathService.list).mockResolvedValue({
      items: [],
      meta: { page: 2, limit: 5, total: 0 },
    } as never);

    renderHook(() => useLearningPaths(2, 5), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    await waitFor(() =>
      expect(learningPathService.list).toHaveBeenCalledWith(2, 5),
    );
  });
});
