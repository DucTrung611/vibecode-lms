import { act, renderHook, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { categoriesService } from '../services/categories.service';
import { useCreateCategory } from '../hooks/useCreateCategory';

vi.mock('../services/categories.service', () => ({
  categoriesService: { list: vi.fn(), create: vi.fn() },
}));
vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

describe('useCreateCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates the category and adds it into the cached category list', async () => {
    const newCategory = {
      id: 'cat_1',
      name: 'Programming',
      slug: 'programming',
      parentId: null,
    };
    vi.mocked(categoriesService.create).mockResolvedValue(newCategory);

    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['categories'], [
      { id: 'cat_0', name: 'Existing', slug: 'existing', parentId: null },
    ]);

    const { result } = renderHook(() => useCreateCategory(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate('Programming');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(categoriesService.create).toHaveBeenCalledWith('Programming');
    expect(queryClient.getQueryData(['categories'])).toEqual([
      { id: 'cat_0', name: 'Existing', slug: 'existing', parentId: null },
      newCategory,
    ]);
  });

  it('toasts an error on failure', async () => {
    vi.mocked(categoriesService.create).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useCreateCategory(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate('Programming');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledTimes(1);
  });
});
