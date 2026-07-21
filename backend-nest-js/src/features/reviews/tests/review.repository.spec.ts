import { Review } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { ReviewRepository } from '../repositories/review.repository';

describe('ReviewRepository', () => {
  let repository: ReviewRepository;
  let prisma: {
    review: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
    };
  };

  const fakeReview = { id: 'rev_1' } as Review;

  beforeEach(() => {
    prisma = {
      review: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
      },
    };
    repository = new ReviewRepository(prisma as unknown as PrismaService);
  });

  describe('findByStudentAndCourse', () => {
    it('queries by the compound unique key', async () => {
      prisma.review.findUnique.mockResolvedValue(fakeReview);

      const result = await repository.findByStudentAndCourse(
        'student_1',
        'course_1',
      );

      expect(prisma.review.findUnique).toHaveBeenCalledWith({
        where: {
          studentId_courseId: { studentId: 'student_1', courseId: 'course_1' },
        },
      });
      expect(result).toBe(fakeReview);
    });
  });

  describe('findByCourse', () => {
    it('paginates and includes the student, ordered by most recent', async () => {
      prisma.review.findMany.mockResolvedValue([fakeReview]);
      prisma.review.count.mockResolvedValue(1);

      const result = await repository.findByCourse('course_1', 2, 10);

      expect(prisma.review.findMany).toHaveBeenCalledWith({
        where: { courseId: 'course_1' },
        include: { student: true },
        orderBy: { createdAt: 'desc' },
        skip: 10,
        take: 10,
      });
      expect(prisma.review.count).toHaveBeenCalledWith({
        where: { courseId: 'course_1' },
      });
      expect(result).toEqual({ items: [fakeReview], total: 1 });
    });
  });

  describe('create', () => {
    it('passes data straight through to prisma', async () => {
      prisma.review.create.mockResolvedValue(fakeReview);
      const data = {
        courseId: 'course_1',
        studentId: 'student_1',
        rating: 5,
        comment: 'Great course',
      };

      const result = await repository.create(data);

      expect(prisma.review.create).toHaveBeenCalledWith({ data });
      expect(result).toBe(fakeReview);
    });
  });
});
