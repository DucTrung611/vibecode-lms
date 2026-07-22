import { PrismaService } from '../../../core/database/prisma.service';
import { InstructorRepository } from '../repositories/instructor.repository';

describe('InstructorRepository', () => {
  let repository: InstructorRepository;
  let prisma: {
    course: { findMany: jest.Mock };
    enrollment: { findMany: jest.Mock };
    review: { aggregate: jest.Mock };
  };

  beforeEach(() => {
    prisma = {
      course: { findMany: jest.fn() },
      enrollment: { findMany: jest.fn() },
      review: { aggregate: jest.fn() },
    };
    repository = new InstructorRepository(prisma as unknown as PrismaService);
  });

  describe('findPublishedCourseIds', () => {
    it('queries published, non-deleted courses for the instructor and returns their ids', async () => {
      prisma.course.findMany.mockResolvedValue([
        { id: 'course_1' },
        { id: 'course_2' },
      ]);

      const result = await repository.findPublishedCourseIds('instructor_1');

      expect(prisma.course.findMany).toHaveBeenCalledWith({
        where: {
          instructorId: 'instructor_1',
          status: 'PUBLISHED',
          deletedAt: null,
        },
        select: { id: true },
      });
      expect(result).toEqual(['course_1', 'course_2']);
    });
  });

  describe('countDistinctStudents', () => {
    it('returns 0 without querying when there are no course ids', async () => {
      const result = await repository.countDistinctStudents([]);

      expect(result).toBe(0);
      expect(prisma.enrollment.findMany).not.toHaveBeenCalled();
    });

    it('counts distinct students across the given courses', async () => {
      prisma.enrollment.findMany.mockResolvedValue([
        { studentId: 'student_1' },
        { studentId: 'student_2' },
      ]);

      const result = await repository.countDistinctStudents([
        'course_1',
        'course_2',
      ]);

      expect(prisma.enrollment.findMany).toHaveBeenCalledWith({
        where: { courseId: { in: ['course_1', 'course_2'] } },
        distinct: ['studentId'],
        select: { studentId: true },
      });
      expect(result).toBe(2);
    });
  });

  describe('ratingSummary', () => {
    it('returns a null average and 0 count without querying when there are no course ids', async () => {
      const result = await repository.ratingSummary([]);

      expect(result).toEqual({ average: null, count: 0 });
      expect(prisma.review.aggregate).not.toHaveBeenCalled();
    });

    it('aggregates the average rating and review count across the given courses', async () => {
      prisma.review.aggregate.mockResolvedValue({
        _avg: { rating: 4.5 },
        _count: 10,
      });

      const result = await repository.ratingSummary(['course_1', 'course_2']);

      expect(prisma.review.aggregate).toHaveBeenCalledWith({
        where: { courseId: { in: ['course_1', 'course_2'] } },
        _avg: { rating: true },
        _count: true,
      });
      expect(result).toEqual({ average: 4.5, count: 10 });
    });
  });
});
