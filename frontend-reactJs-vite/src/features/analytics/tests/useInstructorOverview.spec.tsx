import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { analyticsService } from '../services/analytics.service';
import { useInstructorOverview } from '../hooks/useInstructorOverview';

vi.mock('../services/analytics.service', () => ({
  analyticsService: { getOverview: vi.fn() },
}));

describe('useInstructorOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches the instructor overview', async () => {
    const overview = {
      totals: { totalCourses: 1, totalStudents: 5, totalRevenue: 100, averageRating: 4.5 },
      courses: [],
    };
    vi.mocked(analyticsService.getOverview).mockResolvedValue(overview as never);

    const { result } = renderHook(() => useInstructorOverview(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(analyticsService.getOverview).toHaveBeenCalled();
    expect(result.current.data).toEqual(overview);
  });
});
