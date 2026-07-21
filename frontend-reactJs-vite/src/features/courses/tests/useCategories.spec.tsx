import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { categoriesService } from '../services/categories.service';
import { useCategories } from '../hooks/useCategories';

vi.mock('../services/categories.service', () => ({
  categoriesService: { list: vi.fn(), create: vi.fn() },
}));

describe('useCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches the category list without requiring auth', async () => {
    const categories = [{ id: 'cat_1', name: 'Programming', slug: 'programming', parentId: null }];
    vi.mocked(categoriesService.list).mockResolvedValue(categories);

    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(categoriesService.list).toHaveBeenCalled();
    expect(result.current.data).toEqual(categories);
  });
});
