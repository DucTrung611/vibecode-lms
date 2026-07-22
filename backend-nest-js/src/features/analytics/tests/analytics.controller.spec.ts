import { AnalyticsController } from '../controllers/analytics.controller';
import { AnalyticsService } from '../services/analytics.service';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let analyticsService: jest.Mocked<
    Pick<AnalyticsService, 'getOverview' | 'getCourseAnalytics'>
  >;

  beforeEach(() => {
    analyticsService = {
      getOverview: jest.fn(),
      getCourseAnalytics: jest.fn(),
    };
    controller = new AnalyticsController(
      analyticsService as unknown as AnalyticsService,
    );
  });

  describe('getOverview', () => {
    it('delegates to analyticsService.getOverview with the instructor id', async () => {
      analyticsService.getOverview.mockResolvedValue({
        totals: { totalCourses: 0, totalStudents: 0, totalRevenue: 0, averageRating: null },
        courses: [],
      });

      const result = await controller.getOverview('instructor_1');

      expect(analyticsService.getOverview).toHaveBeenCalledWith('instructor_1');
      expect(result.totals.totalCourses).toBe(0);
    });
  });

  describe('getCourseAnalytics', () => {
    it('delegates to analyticsService.getCourseAnalytics with instructor and course id', async () => {
      analyticsService.getCourseAnalytics.mockResolvedValue({ id: 'course_1' } as never);

      const result = await controller.getCourseAnalytics('instructor_1', 'course_1');

      expect(analyticsService.getCourseAnalytics).toHaveBeenCalledWith(
        'instructor_1',
        'course_1',
      );
      expect(result).toEqual({ id: 'course_1' });
    });
  });
});
