import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { instructorsService } from '../services/instructors.service';
import { useInstructorProfile } from '../hooks/useInstructorProfile';

vi.mock('../services/instructors.service', () => ({
  instructorsService: { getProfile: vi.fn(), getCourses: vi.fn() },
}));

describe('useInstructorProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches the instructor profile', async () => {
    const profile = {
      id: 'instructor_1',
      fullName: 'Prof X',
      avatarUrl: null,
      bio: 'Teaches things.',
      stats: {
        totalCourses: 2,
        totalStudents: 15,
        averageRating: 4.6,
        reviewCount: 5,
      },
    };
    vi.mocked(instructorsService.getProfile).mockResolvedValue(profile as never);

    const { result } = renderHook(() => useInstructorProfile('instructor_1'), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(instructorsService.getProfile).toHaveBeenCalledWith('instructor_1');
    expect(result.current.data).toEqual(profile);
  });

  it('does not fetch when id is undefined', () => {
    renderHook(() => useInstructorProfile(undefined), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    expect(instructorsService.getProfile).not.toHaveBeenCalled();
  });
});
