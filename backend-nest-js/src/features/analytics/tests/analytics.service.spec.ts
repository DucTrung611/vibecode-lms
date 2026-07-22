import { CoursesService } from '../../courses/services/courses.service';
import { AnalyticsRepository } from '../repositories/analytics.repository';
import { AnalyticsService } from '../services/analytics.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let analyticsRepository: jest.Mocked<
    Pick<
      AnalyticsRepository,
      | 'countEnrollments'
      | 'countCompletedEnrollments'
      | 'sumRevenue'
      | 'ratingSummary'
      | 'avgQuizScore'
      | 'findInstructorCourses'
    >
  >;
  let coursesService: jest.Mocked<Pick<CoursesService, 'findById'>>;

  beforeEach(() => {
    analyticsRepository = {
      countEnrollments: jest.fn(),
      countCompletedEnrollments: jest.fn(),
      sumRevenue: jest.fn(),
      ratingSummary: jest.fn(),
      avgQuizScore: jest.fn(),
      findInstructorCourses: jest.fn(),
    };
    coursesService = { findById: jest.fn() };

    service = new AnalyticsService(
      analyticsRepository as unknown as AnalyticsRepository,
      coursesService as unknown as CoursesService,
    );
  });

  describe('getCourseAnalytics', () => {
    it('throws AUTH_003 (403) when the instructor does not own the course', async () => {
      coursesService.findById.mockResolvedValue({
        id: 'course_1',
        title: 'Intro',
        instructorId: 'other_instructor',
      } as never);

      await expect(
        service.getCourseAnalytics('instructor_1', 'course_1'),
      ).rejects.toMatchObject({ httpStatus: 403, code: 'AUTH_003' });
      expect(analyticsRepository.countEnrollments).not.toHaveBeenCalled();
    });

    it('computes a 0 completion rate when there are no enrollments', async () => {
      coursesService.findById.mockResolvedValue({
        id: 'course_1',
        title: 'Intro',
        instructorId: 'instructor_1',
      } as never);
      analyticsRepository.countEnrollments.mockResolvedValue(0);
      analyticsRepository.countCompletedEnrollments.mockResolvedValue(0);
      analyticsRepository.sumRevenue.mockResolvedValue(0);
      analyticsRepository.ratingSummary.mockResolvedValue({ average: null, count: 0 });
      analyticsRepository.avgQuizScore.mockResolvedValue(null);

      const result = await service.getCourseAnalytics('instructor_1', 'course_1');

      expect(result.completionRate).toBe(0);
    });

    it('returns full analytics for an owned course', async () => {
      coursesService.findById.mockResolvedValue({
        id: 'course_1',
        title: 'Intro',
        instructorId: 'instructor_1',
      } as never);
      analyticsRepository.countEnrollments.mockResolvedValue(10);
      analyticsRepository.countCompletedEnrollments.mockResolvedValue(4);
      analyticsRepository.sumRevenue.mockResolvedValue(500);
      analyticsRepository.ratingSummary.mockResolvedValue({ average: 4.2, count: 6 });
      analyticsRepository.avgQuizScore.mockResolvedValue(75);

      const result = await service.getCourseAnalytics('instructor_1', 'course_1');

      expect(result).toEqual({
        id: 'course_1',
        title: 'Intro',
        enrolledCount: 10,
        completionRate: 0.4,
        revenue: 500,
        averageRating: 4.2,
        reviewCount: 6,
        averageQuizScore: 75,
      });
    });
  });

  describe('getOverview', () => {
    it('returns zeroed totals when the instructor has no courses', async () => {
      analyticsRepository.findInstructorCourses.mockResolvedValue([]);

      const result = await service.getOverview('instructor_1');

      expect(result).toEqual({
        totals: {
          totalCourses: 0,
          totalStudents: 0,
          totalRevenue: 0,
          averageRating: null,
        },
        courses: [],
      });
    });

    it('aggregates totals with a review-count-weighted average rating', async () => {
      analyticsRepository.findInstructorCourses.mockResolvedValue([
        { id: 'course_1', title: 'Intro' },
        { id: 'course_2', title: 'Advanced' },
      ]);
      analyticsRepository.countEnrollments
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(5);
      analyticsRepository.countCompletedEnrollments
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(1);
      analyticsRepository.sumRevenue
        .mockResolvedValueOnce(300)
        .mockResolvedValueOnce(100);
      analyticsRepository.ratingSummary
        .mockResolvedValueOnce({ average: 5, count: 4 })
        .mockResolvedValueOnce({ average: 3, count: 1 });

      const result = await service.getOverview('instructor_1');

      expect(result.totals).toEqual({
        totalCourses: 2,
        totalStudents: 15,
        totalRevenue: 400,
        // (5*4 + 3*1) / (4+1) = 23/5 = 4.6
        averageRating: 4.6,
      });
      expect(result.courses).toHaveLength(2);
    });
  });
});
