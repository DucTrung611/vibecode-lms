import { act, renderHook, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { coursesService } from '../services/courses.service';
import { useCreateCourse } from '../hooks/useCreateCourse';

vi.mock('../services/courses.service', () => ({
  coursesService: { create: vi.fn() },
}));
vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('useCreateCourse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const formValues = {
    title: 'Intro to Algebra',
    description: 'desc',
    price: 10,
    level: 'BEGINNER' as const,
    status: 'DRAFT' as const,
    thumbnailUrl: '',
  };

  it('strips status/blank thumbnailUrl and navigates to the edit page on success', async () => {
    vi.mocked(coursesService.create).mockResolvedValue({
      id: 'course_1',
    } as never);

    const { result } = renderHook(() => useCreateCourse(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate(formValues);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(coursesService.create).toHaveBeenCalledWith({
      title: 'Intro to Algebra',
      description: 'desc',
      price: 10,
      level: 'BEGINNER',
      thumbnailUrl: undefined,
    });
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(
      '/instructor/courses/course_1/edit',
      { replace: true },
    );
  });

  it('toasts an error and does not navigate on failure', async () => {
    vi.mocked(coursesService.create).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useCreateCourse(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    act(() => {
      result.current.mutate(formValues);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
