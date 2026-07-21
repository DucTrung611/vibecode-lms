import { act, renderHook, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { uploadFile } from '@/shared/services/upload.service';
import { useFileUpload } from '../useFileUpload';

vi.mock('@/shared/services/upload.service', () => ({
  uploadFile: vi.fn(),
}));
vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

describe('useFileUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uploads the file and resolves with the returned fileUrl', async () => {
    vi.mocked(uploadFile).mockResolvedValue({
      fileUrl: 'http://localhost:3000/uploads/a.png',
    });
    const file = new File(['x'], 'a.png', { type: 'image/png' });

    const { result } = renderHook(() => useFileUpload(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate(file);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(uploadFile).toHaveBeenCalledWith(file);
    expect(result.current.data).toEqual({
      fileUrl: 'http://localhost:3000/uploads/a.png',
    });
  });

  it('toasts an error on failure', async () => {
    vi.mocked(uploadFile).mockRejectedValue(new Error('boom'));
    const file = new File(['x'], 'a.png', { type: 'image/png' });

    const { result } = renderHook(() => useFileUpload(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate(file);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledTimes(1);
  });
});
