import { LearningPath, LearningPathEnrollment } from '@prisma/client';
import { LearningPathEnrollmentRepository } from '../repositories/learning-path-enrollment.repository';
import { LearningPathRepository } from '../repositories/learning-path.repository';
import { LearningPathsService } from '../services/learning-paths.service';

describe('LearningPathsService', () => {
  let service: LearningPathsService;
  let learningPathRepository: jest.Mocked<
    Pick<LearningPathRepository, 'findMany' | 'findById'>
  >;
  let enrollmentRepository: jest.Mocked<
    Pick<LearningPathEnrollmentRepository, 'findByStudentAndPath' | 'create'>
  >;

  const fakePath = { id: 'path_1' } as LearningPath;
  const fakeEnrollment: LearningPathEnrollment = {
    id: 'lpe_1',
    studentId: 'student_1',
    learningPathId: 'path_1',
    progressPercent: 0,
    startedAt: new Date('2026-01-01'),
    completedAt: null,
  };

  beforeEach(() => {
    learningPathRepository = {
      findMany: jest.fn(),
      findById: jest.fn(),
    };
    enrollmentRepository = {
      findByStudentAndPath: jest.fn(),
      create: jest.fn(),
    };

    service = new LearningPathsService(
      learningPathRepository as unknown as LearningPathRepository,
      enrollmentRepository as unknown as LearningPathEnrollmentRepository,
    );
  });

  describe('findAll', () => {
    it('normalizes pagination defaults and maps results', async () => {
      learningPathRepository.findMany.mockResolvedValue({
        items: [fakePath],
        total: 1,
      } as never);

      const result = await service.findAll();

      expect(learningPathRepository.findMany).toHaveBeenCalledWith(1, 20);
      expect(result.meta).toEqual({ page: 1, limit: 20, total: 1 });
      expect(result.items[0].id).toBe('path_1');
    });

    it('forwards explicit page/limit', async () => {
      learningPathRepository.findMany.mockResolvedValue({
        items: [],
        total: 0,
      });

      await service.findAll(3, 5);

      expect(learningPathRepository.findMany).toHaveBeenCalledWith(3, 5);
    });
  });

  describe('enroll', () => {
    it('throws LEARNING_PATH_001 (404) when the path does not exist', async () => {
      learningPathRepository.findById.mockResolvedValue(null);

      await expect(
        service.enroll('student_1', 'missing'),
      ).rejects.toMatchObject({ httpStatus: 404, code: 'LEARNING_PATH_001' });
      expect(enrollmentRepository.create).not.toHaveBeenCalled();
    });

    it('throws LEARNING_PATH_002 (409) when already enrolled', async () => {
      learningPathRepository.findById.mockResolvedValue(fakePath);
      enrollmentRepository.findByStudentAndPath.mockResolvedValue(
        fakeEnrollment,
      );

      await expect(service.enroll('student_1', 'path_1')).rejects.toMatchObject(
        { httpStatus: 409, code: 'LEARNING_PATH_002' },
      );
      expect(enrollmentRepository.create).not.toHaveBeenCalled();
    });

    it('creates the enrollment when the path exists and is not already joined', async () => {
      learningPathRepository.findById.mockResolvedValue(fakePath);
      enrollmentRepository.findByStudentAndPath.mockResolvedValue(null);
      enrollmentRepository.create.mockResolvedValue(fakeEnrollment);

      const result = await service.enroll('student_1', 'path_1');

      expect(enrollmentRepository.create).toHaveBeenCalledWith({
        studentId: 'student_1',
        learningPathId: 'path_1',
      });
      expect(result.id).toBe('lpe_1');
    });
  });
});
