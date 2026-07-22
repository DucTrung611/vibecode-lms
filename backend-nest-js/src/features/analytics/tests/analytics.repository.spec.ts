import { PrismaService } from '../../../core/database/prisma.service';
import { AnalyticsRepository } from '../repositories/analytics.repository';

describe('AnalyticsRepository', () => {
  let repository: AnalyticsRepository;
  let prisma: {
    enrollment: { count: jest.Mock };
    orderItem: { aggregate: jest.Mock };
    review: { aggregate: jest.Mock };
    quizAttempt: { aggregate: jest.Mock };
    course: { findMany: jest.Mock };
  };

  beforeEach(() => {
    prisma = {
      enrollment: { count: jest.fn() },
      orderItem: { aggregate: jest.fn() },
      review: { aggregate: jest.fn() },
      quizAttempt: { aggregate: jest.fn() },
      course: { findMany: jest.fn() },
    };
    repository = new AnalyticsRepository(prisma as unknown as PrismaService);
  });

  describe('countEnrollments', () => {
    it('counts all enrollments for a course', async () => {
      prisma.enrollment.count.mockResolvedValue(12);

      const result = await repository.countEnrollments('course_1');

      expect(prisma.enrollment.count).toHaveBeenCalledWith({
        where: { courseId: 'course_1' },
      });
      expect(result).toBe(12);
    });
  });

  describe('countCompletedEnrollments', () => {
    it('counts only completed enrollments', async () => {
      prisma.enrollment.count.mockResolvedValue(4);

      const result = await repository.countCompletedEnrollments('course_1');

      expect(prisma.enrollment.count).toHaveBeenCalledWith({
        where: { courseId: 'course_1', status: 'COMPLETED' },
      });
      expect(result).toBe(4);
    });
  });

  describe('sumRevenue', () => {
    it('sums paid order item prices for a course', async () => {
      prisma.orderItem.aggregate.mockResolvedValue({ _sum: { price: 199.98 } });

      const result = await repository.sumRevenue('course_1');

      expect(prisma.orderItem.aggregate).toHaveBeenCalledWith({
        where: { courseId: 'course_1', order: { status: 'PAID' } },
        _sum: { price: true },
      });
      expect(result).toBe(199.98);
    });

    it('returns 0 when there is no revenue yet', async () => {
      prisma.orderItem.aggregate.mockResolvedValue({ _sum: { price: null } });

      const result = await repository.sumRevenue('course_1');

      expect(result).toBe(0);
    });
  });

  describe('ratingSummary', () => {
    it('returns the average rating and review count', async () => {
      prisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.5 }, _count: 10 });

      const result = await repository.ratingSummary('course_1');

      expect(prisma.review.aggregate).toHaveBeenCalledWith({
        where: { courseId: 'course_1' },
        _avg: { rating: true },
        _count: true,
      });
      expect(result).toEqual({ average: 4.5, count: 10 });
    });
  });

  describe('avgQuizScore', () => {
    it('averages submitted attempt scores through the lesson/module relation chain', async () => {
      prisma.quizAttempt.aggregate.mockResolvedValue({ _avg: { score: 82 } });

      const result = await repository.avgQuizScore('course_1');

      expect(prisma.quizAttempt.aggregate).toHaveBeenCalledWith({
        where: {
          submittedAt: { not: null },
          quiz: { lesson: { module: { courseId: 'course_1' } } },
        },
        _avg: { score: true },
      });
      expect(result).toBe(82);
    });
  });

  describe('findInstructorCourses', () => {
    it('finds non-deleted courses owned by the instructor', async () => {
      const courses = [{ id: 'course_1', title: 'Intro' }];
      prisma.course.findMany.mockResolvedValue(courses);

      const result = await repository.findInstructorCourses('instructor_1');

      expect(prisma.course.findMany).toHaveBeenCalledWith({
        where: { instructorId: 'instructor_1', deletedAt: null },
        select: { id: true, title: true },
      });
      expect(result).toBe(courses);
    });
  });
});
