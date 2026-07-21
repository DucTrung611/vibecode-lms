import { LearningPath, LearningPathEnrollment } from '@prisma/client';
import { AiClientService } from '../../../core/ai/ai-client.service';
import { CoursesService } from '../../courses/services/courses.service';
import { LearningPathEnrollmentRepository } from '../repositories/learning-path-enrollment.repository';
import { LearningPathRepository } from '../repositories/learning-path.repository';
import { LearningPathsService } from '../services/learning-paths.service';

describe('LearningPathsService', () => {
  let service: LearningPathsService;
  let learningPathRepository: jest.Mocked<
    Pick<LearningPathRepository, 'findMany' | 'findById' | 'createGenerated'>
  >;
  let enrollmentRepository: jest.Mocked<
    Pick<LearningPathEnrollmentRepository, 'findByStudentAndPath' | 'create'>
  >;
  let coursesService: jest.Mocked<Pick<CoursesService, 'findAll'>>;
  let aiClient: jest.Mocked<Pick<AiClientService, 'complete'>>;

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
      createGenerated: jest.fn(),
    };
    enrollmentRepository = {
      findByStudentAndPath: jest.fn(),
      create: jest.fn(),
    };
    coursesService = { findAll: jest.fn() };
    aiClient = { complete: jest.fn() };

    service = new LearningPathsService(
      learningPathRepository as unknown as LearningPathRepository,
      enrollmentRepository as unknown as LearningPathEnrollmentRepository,
      coursesService as unknown as CoursesService,
      aiClient as unknown as AiClientService,
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

  describe('generate', () => {
    const candidateCourses = [
      {
        id: 'course_1',
        title: 'HTML Basics',
        description: 'Intro to HTML',
        level: 'BEGINNER',
      },
      {
        id: 'course_2',
        title: 'CSS Basics',
        description: 'Intro to CSS',
        level: 'BEGINNER',
      },
    ];

    it('throws LEARNING_PATH_004 (422) when there are no published courses', async () => {
      coursesService.findAll.mockResolvedValue({
        items: [],
        meta: { page: 1, limit: 100, total: 0 },
      });

      await expect(service.generate('student_1', {})).rejects.toMatchObject({
        httpStatus: 422,
        code: 'LEARNING_PATH_004',
      });
      expect(aiClient.complete).not.toHaveBeenCalled();
    });

    it('generates and persists a learning path from the AI response', async () => {
      coursesService.findAll.mockResolvedValue({
        items: candidateCourses,
        meta: { page: 1, limit: 100, total: 2 },
      } as never);
      aiClient.complete.mockResolvedValue(
        JSON.stringify({
          title: 'Frontend Foundations',
          description: 'HTML then CSS',
          courseIds: ['course_1', 'course_2'],
        }),
      );
      learningPathRepository.createGenerated.mockResolvedValue({
        id: 'path_generated_1',
        title: 'Frontend Foundations',
        description: 'HTML then CSS',
        createdById: 'student_1',
        isAiGenerated: true,
        items: [],
      });

      const result = await service.generate('student_1', {
        topic: 'frontend development',
      });

      expect(coursesService.findAll).toHaveBeenCalledWith({
        status: 'PUBLISHED',
        limit: 100,
      });
      expect(aiClient.complete).toHaveBeenCalledWith([
        expect.objectContaining({ role: 'system' }) as unknown,
        expect.objectContaining({
          role: 'user',
          content: expect.stringContaining('frontend development') as string,
        }) as unknown,
      ]);
      expect(learningPathRepository.createGenerated).toHaveBeenCalledWith({
        title: 'Frontend Foundations',
        description: 'HTML then CSS',
        createdById: 'student_1',
        courseIds: ['course_1', 'course_2'],
      });
      expect(result.id).toBe('path_generated_1');
    });

    it('propagates LEARNING_PATH_003 (502) when the AI references a course id not in the catalog', async () => {
      coursesService.findAll.mockResolvedValue({
        items: candidateCourses,
        meta: { page: 1, limit: 100, total: 2 },
      } as never);
      aiClient.complete.mockResolvedValue(
        JSON.stringify({
          title: 'Frontend Foundations',
          courseIds: ['course_1', 'hallucinated_course'],
        }),
      );

      await expect(service.generate('student_1', {})).rejects.toMatchObject({
        httpStatus: 502,
        code: 'LEARNING_PATH_003',
      });
      expect(learningPathRepository.createGenerated).not.toHaveBeenCalled();
    });
  });
});
