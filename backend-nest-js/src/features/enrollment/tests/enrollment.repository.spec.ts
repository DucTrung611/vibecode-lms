import { Enrollment } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { EnrollmentRepository } from '../repositories/enrollment.repository';

describe('EnrollmentRepository', () => {
  let repository: EnrollmentRepository;
  let prisma: {
    enrollment: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  const fakeEnrollment = { id: 'enr_1' } as Enrollment;

  beforeEach(() => {
    prisma = {
      enrollment: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    repository = new EnrollmentRepository(prisma as unknown as PrismaService);
  });

  describe('findByStudentAndCourse', () => {
    it('queries by the compound unique key', async () => {
      prisma.enrollment.findUnique.mockResolvedValue(fakeEnrollment);

      const result = await repository.findByStudentAndCourse(
        'student_1',
        'course_1',
      );

      expect(prisma.enrollment.findUnique).toHaveBeenCalledWith({
        where: {
          studentId_courseId: { studentId: 'student_1', courseId: 'course_1' },
        },
      });
      expect(result).toBe(fakeEnrollment);
    });
  });

  describe('findById', () => {
    it('queries by id', async () => {
      prisma.enrollment.findUnique.mockResolvedValue(fakeEnrollment);

      const result = await repository.findById('enr_1');

      expect(prisma.enrollment.findUnique).toHaveBeenCalledWith({
        where: { id: 'enr_1' },
      });
      expect(result).toBe(fakeEnrollment);
    });
  });

  describe('findByStudent', () => {
    it('paginates and includes the course, ordered by most recent', async () => {
      prisma.enrollment.findMany.mockResolvedValue([fakeEnrollment]);
      prisma.enrollment.count.mockResolvedValue(1);

      const result = await repository.findByStudent('student_1', 2, 10);

      expect(prisma.enrollment.findMany).toHaveBeenCalledWith({
        where: { studentId: 'student_1' },
        include: { course: true },
        orderBy: { enrolledAt: 'desc' },
        skip: 10,
        take: 10,
      });
      expect(prisma.enrollment.count).toHaveBeenCalledWith({
        where: { studentId: 'student_1' },
      });
      expect(result).toEqual({ items: [fakeEnrollment], total: 1 });
    });
  });

  describe('create', () => {
    it('passes data straight through to prisma', async () => {
      prisma.enrollment.create.mockResolvedValue(fakeEnrollment);
      const data = { studentId: 'student_1', courseId: 'course_1' };

      const result = await repository.create(data);

      expect(prisma.enrollment.create).toHaveBeenCalledWith({ data });
      expect(result).toBe(fakeEnrollment);
    });
  });

  describe('markCompleted', () => {
    it('sets status COMPLETED and completedAt to now', async () => {
      prisma.enrollment.update.mockResolvedValue(fakeEnrollment);

      const result = await repository.markCompleted('enr_1');

      expect(prisma.enrollment.update).toHaveBeenCalledWith({
        where: { id: 'enr_1' },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: { status: 'COMPLETED', completedAt: expect.any(Date) },
      });
      expect(result).toBe(fakeEnrollment);
    });
  });
});
