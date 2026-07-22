import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { analyticsService } from '../services/analytics.service';
import { useCourseAnalytics } from '../hooks/useCourseAnalytics';

vi.mock('../services/analytics.service', () => ({
  analyticsService: { getCourseAnalytics: vi.fn() },
}));

describe('useCourseAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches analytics for a single course', async () => {
    const detail = {
      id: 'course_1',
      title: 'Intro',
      enrolledCount: 10,
      completionRate: 0.4,
      revenue: 300,
      averageRating: 4.5,
      reviewCount: 4,
      averageQuizScore: 82,
    };
    vi.mocked(analyticsService.getCourseAnalytics).mockResolvedValue(detail as never);

    const { result } = renderHook(() => useCourseAnalytics('course_1'), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(analyticsService.getCourseAnalytics).toHaveBeenCalledWith('course_1');
    expect(result.current.data).toEqual(detail);
  });
});
