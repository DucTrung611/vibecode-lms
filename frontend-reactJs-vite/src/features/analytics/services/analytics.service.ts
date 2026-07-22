import { api, unwrap } from '@/shared/services/api';
import type { ApiSuccess } from '@/shared/types/api.types';
import type { CourseAnalyticsDetail, InstructorOverview } from '../types/analytics.types';

export const analyticsService = {
  getOverview: () =>
    api.get<ApiSuccess<InstructorOverview>>('/instructor/analytics/overview').then(unwrap),

  getCourseAnalytics: (courseId: string) =>
    api
      .get<ApiSuccess<CourseAnalyticsDetail>>(`/instructor/courses/${courseId}/analytics`)
      .then(unwrap),
};
