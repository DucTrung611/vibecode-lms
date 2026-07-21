import { LearningPathEnrollment } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { LearningPathEnrollmentRepository } from '../repositories/learning-path-enrollment.repository';

describe('LearningPathEnrollmentRepository', () => {
  let repository: LearningPathEnrollmentRepository;
  let prisma: {
    learningPathEnrollment: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };

  const fakeEnrollment = { id: 'lpe_1' } as LearningPathEnrollment;

  beforeEach(() => {
    prisma = {
      learningPathEnrollment: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };
    repository = new LearningPathEnrollmentRepository(
      prisma as unknown as PrismaService,
    );
  });

  describe('findByStudentAndPath', () => {
    it('queries by the compound unique key', async () => {
      prisma.learningPathEnrollment.findUnique.mockResolvedValue(
        fakeEnrollment,
      );

      const result = await repository.findByStudentAndPath(
        'student_1',
        'path_1',
      );

      expect(prisma.learningPathEnrollment.findUnique).toHaveBeenCalledWith({
        where: {
          studentId_learningPathId: {
            studentId: 'student_1',
            learningPathId: 'path_1',
          },
        },
      });
      expect(result).toBe(fakeEnrollment);
    });
  });

  describe('create', () => {
    it('passes data straight through to prisma', async () => {
      prisma.learningPathEnrollment.create.mockResolvedValue(fakeEnrollment);
      const data = { studentId: 'student_1', learningPathId: 'path_1' };

      const result = await repository.create(data);

      expect(prisma.learningPathEnrollment.create).toHaveBeenCalledWith({
        data,
      });
      expect(result).toBe(fakeEnrollment);
    });
  });
});
