import { Course } from '@prisma/client';
import { CourseRepository } from '../repositories/course.repository';
import { LessonRepository } from '../repositories/lesson.repository';
import { ModuleRepository } from '../repositories/module.repository';
import { CoursesService } from '../services/courses.service';
import * as slugUtil from '../utils/slug.util';

jest.mock('../utils/slug.util');

describe('CoursesService', () => {
  let service: CoursesService;
  let courseRepository: jest.Mocked<
    Pick<
      CourseRepository,
      | 'findMany'
      | 'findById'
      | 'findByIdWithDetail'
      | 'findBySlug'
      | 'categoryExists'
      | 'create'
      | 'update'
      | 'softDelete'
    >
  >;
  let moduleRepository: jest.Mocked<
    Pick<ModuleRepository, 'findById' | 'countByCourse' | 'create'>
  >;
  let lessonRepository: jest.Mocked<
    Pick<LessonRepository, 'countByModule' | 'create'>
  >;

  const slugify = slugUtil.slugify as jest.Mock;
  const withRandomSuffix = slugUtil.withRandomSuffix as jest.Mock;

  const fakeCourse: Course = {
    id: 'course_1',
    title: 'Intro to Algebra',
    slug: 'intro-to-algebra',
    description: 'desc',
    thumbnailUrl: null,
    price: 0 as never,
    level: 'BEGINNER',
    status: 'DRAFT',
    instructorId: 'instructor_1',
    categoryId: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
  };

  beforeEach(() => {
    courseRepository = {
      findMany: jest.fn(),
      findById: jest.fn(),
      findByIdWithDetail: jest.fn(),
      findBySlug: jest.fn(),
      categoryExists: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };
    moduleRepository = {
      findById: jest.fn(),
      countByCourse: jest.fn(),
      create: jest.fn(),
    };
    lessonRepository = {
      countByModule: jest.fn(),
      create: jest.fn(),
    };

    slugify.mockImplementation((title: string) =>
      title.toLowerCase().replace(/\s+/g, '-'),
    );
    withRandomSuffix.mockImplementation((base: string) => `${base}-abc123`);

    service = new CoursesService(
      courseRepository as unknown as CourseRepository,
      moduleRepository as unknown as ModuleRepository,
      lessonRepository as unknown as LessonRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('normalizes pagination and defaults sort, then maps results', async () => {
      courseRepository.findMany.mockResolvedValue({
        items: [fakeCourse],
        total: 1,
      });

      const result = await service.findAll({});

      expect(courseRepository.findMany).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        order: 'desc',
        status: undefined,
        categoryId: undefined,
        level: undefined,
      });
      expect(result.meta).toEqual({ page: 1, limit: 20, total: 1 });
      expect(result.items[0]).toMatchObject({ id: 'course_1' });
    });

    it('forwards explicit filters and sort options', async () => {
      courseRepository.findMany.mockResolvedValue({ items: [], total: 0 });

      await service.findAll({
        page: 2,
        limit: 10,
        sortBy: 'price',
        order: 'asc',
        status: 'PUBLISHED',
        categoryId: 'cat_1',
        level: 'ADVANCED',
      });

      expect(courseRepository.findMany).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        sortBy: 'price',
        order: 'asc',
        status: 'PUBLISHED',
        categoryId: 'cat_1',
        level: 'ADVANCED',
      });
    });
  });

  describe('findById', () => {
    it('throws COURSE_004 (404) when the course does not exist', async () => {
      courseRepository.findByIdWithDetail.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toMatchObject({
        httpStatus: 404,
        code: 'COURSE_004',
      });
    });

    it('returns the mapped course on success', async () => {
      courseRepository.findByIdWithDetail.mockResolvedValue(
        fakeCourse as never,
      );

      const result = await service.findById('course_1');

      expect(result.id).toBe('course_1');
    });

    it("resolves each lesson's linked quiz/assignment ids for discovery", async () => {
      courseRepository.findByIdWithDetail.mockResolvedValue({
        ...fakeCourse,
        modules: [
          {
            id: 'module_1',
            courseId: 'course_1',
            title: 'Module 1',
            order: 0,
            lessons: [
              {
                id: 'lesson_1',
                moduleId: 'module_1',
                title: 'Lesson 1',
                type: 'QUIZ',
                videoUrl: null,
                content: null,
                durationSec: null,
                order: 0,
                quizzes: [{ id: 'quiz_1' }],
                assignments: [],
              },
              {
                id: 'lesson_2',
                moduleId: 'module_1',
                title: 'Lesson 2',
                type: 'ASSIGNMENT',
                videoUrl: null,
                content: null,
                durationSec: null,
                order: 1,
                quizzes: [],
                assignments: [{ id: 'assignment_1' }],
              },
              {
                id: 'lesson_3',
                moduleId: 'module_1',
                title: 'Lesson 3',
                type: 'VIDEO',
                videoUrl: 'https://example.com/video.mp4',
                content: null,
                durationSec: 120,
                order: 2,
              },
            ],
          },
        ],
      } as never);

      const result = await service.findById('course_1');

      const [lesson1, lesson2, lesson3] = result.modules![0].lessons!;
      expect(lesson1.quizId).toBe('quiz_1');
      expect(lesson1.assignmentId).toBeNull();
      expect(lesson2.assignmentId).toBe('assignment_1');
      expect(lesson2.quizId).toBeNull();
      expect(lesson3.quizId).toBeNull();
      expect(lesson3.assignmentId).toBeNull();
    });
  });

  describe('create', () => {
    const dto = {
      title: 'Intro to Algebra',
      description: 'desc',
      price: 0,
      level: 'BEGINNER' as const,
    };

    it('throws COURSE_005 (404) when categoryId is provided but does not exist', async () => {
      courseRepository.categoryExists.mockResolvedValue(false);

      await expect(
        service.create('instructor_1', { ...dto, categoryId: 'cat_missing' }),
      ).rejects.toMatchObject({ httpStatus: 404, code: 'COURSE_005' });
      expect(courseRepository.create).not.toHaveBeenCalled();
    });

    it('uses the plain slug when it is not already taken', async () => {
      courseRepository.findBySlug.mockResolvedValue(null);
      courseRepository.create.mockResolvedValue(fakeCourse);

      await service.create('instructor_1', dto);

      expect(courseRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'intro-to-algebra',
          instructorId: 'instructor_1',
          title: dto.title,
        }),
      );
    });

    it('appends a random suffix when the base slug is already taken', async () => {
      courseRepository.findBySlug
        .mockResolvedValueOnce(fakeCourse) // base slug taken
        .mockResolvedValueOnce(null); // suffixed candidate free
      courseRepository.create.mockResolvedValue(fakeCourse);

      await service.create('instructor_1', dto);

      expect(withRandomSuffix).toHaveBeenCalledWith('intro-to-algebra');
      expect(courseRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'intro-to-algebra-abc123' }),
      );
    });

    it('does not check category existence when categoryId is omitted', async () => {
      courseRepository.findBySlug.mockResolvedValue(null);
      courseRepository.create.mockResolvedValue(fakeCourse);

      await service.create('instructor_1', dto);

      expect(courseRepository.categoryExists).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('throws COURSE_004 (404) when the course does not exist', async () => {
      courseRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('instructor_1', 'missing', { title: 'New' }),
      ).rejects.toMatchObject({ httpStatus: 404, code: 'COURSE_004' });
    });

    it('throws AUTH_003 (403) when the caller does not own the course', async () => {
      courseRepository.findById.mockResolvedValue(fakeCourse);

      await expect(
        service.update('someone_else', 'course_1', { title: 'New' }),
      ).rejects.toMatchObject({ httpStatus: 403, code: 'AUTH_003' });
      expect(courseRepository.update).not.toHaveBeenCalled();
    });

    it('throws COURSE_005 (404) when the new categoryId does not exist', async () => {
      courseRepository.findById.mockResolvedValue(fakeCourse);
      courseRepository.categoryExists.mockResolvedValue(false);

      await expect(
        service.update('instructor_1', 'course_1', { categoryId: 'cat_x' }),
      ).rejects.toMatchObject({ httpStatus: 404, code: 'COURSE_005' });
      expect(courseRepository.update).not.toHaveBeenCalled();
    });

    it('updates and returns the mapped course on success', async () => {
      courseRepository.findById.mockResolvedValue(fakeCourse);
      courseRepository.update.mockResolvedValue({
        ...fakeCourse,
        title: 'Updated',
      });

      const result = await service.update('instructor_1', 'course_1', {
        title: 'Updated',
      });

      expect(courseRepository.update).toHaveBeenCalledWith('course_1', {
        title: 'Updated',
      });
      expect(result.title).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('throws COURSE_004 (404) when the course does not exist', async () => {
      courseRepository.findById.mockResolvedValue(null);

      await expect(
        service.remove('instructor_1', 'missing'),
      ).rejects.toMatchObject({ httpStatus: 404, code: 'COURSE_004' });
    });

    it('throws AUTH_003 (403) when the caller does not own the course', async () => {
      courseRepository.findById.mockResolvedValue(fakeCourse);

      await expect(
        service.remove('someone_else', 'course_1'),
      ).rejects.toMatchObject({ httpStatus: 403, code: 'AUTH_003' });
      expect(courseRepository.softDelete).not.toHaveBeenCalled();
    });

    it('soft-deletes the course on success', async () => {
      courseRepository.findById.mockResolvedValue(fakeCourse);

      await service.remove('instructor_1', 'course_1');

      expect(courseRepository.softDelete).toHaveBeenCalledWith('course_1');
    });
  });

  describe('addModule', () => {
    it('throws COURSE_004 (404) when the course does not exist', async () => {
      courseRepository.findById.mockResolvedValue(null);

      await expect(
        service.addModule('instructor_1', 'missing', { title: 'M1' }),
      ).rejects.toMatchObject({ httpStatus: 404, code: 'COURSE_004' });
    });

    it('throws AUTH_003 (403) when the caller does not own the course', async () => {
      courseRepository.findById.mockResolvedValue(fakeCourse);

      await expect(
        service.addModule('someone_else', 'course_1', { title: 'M1' }),
      ).rejects.toMatchObject({ httpStatus: 403, code: 'AUTH_003' });
    });

    it('uses the given order when provided', async () => {
      courseRepository.findById.mockResolvedValue(fakeCourse);
      moduleRepository.create.mockResolvedValue({
        id: 'module_1',
        courseId: 'course_1',
        title: 'M1',
        order: 5,
      });

      await service.addModule('instructor_1', 'course_1', {
        title: 'M1',
        order: 5,
      });

      expect(moduleRepository.countByCourse).not.toHaveBeenCalled();
      expect(moduleRepository.create).toHaveBeenCalledWith({
        courseId: 'course_1',
        title: 'M1',
        order: 5,
      });
    });

    it('falls back to the current sibling count when order is omitted', async () => {
      courseRepository.findById.mockResolvedValue(fakeCourse);
      moduleRepository.countByCourse.mockResolvedValue(2);
      moduleRepository.create.mockResolvedValue({
        id: 'module_1',
        courseId: 'course_1',
        title: 'M1',
        order: 2,
      });

      const result = await service.addModule('instructor_1', 'course_1', {
        title: 'M1',
      });

      expect(moduleRepository.countByCourse).toHaveBeenCalledWith('course_1');
      expect(moduleRepository.create).toHaveBeenCalledWith({
        courseId: 'course_1',
        title: 'M1',
        order: 2,
      });
      expect(result.order).toBe(2);
    });
  });

  describe('addLesson', () => {
    it('throws COURSE_006 (404) when the module does not exist', async () => {
      moduleRepository.findById.mockResolvedValue(null);

      await expect(
        service.addLesson('instructor_1', 'missing', {
          title: 'L1',
          type: 'VIDEO',
        }),
      ).rejects.toMatchObject({ httpStatus: 404, code: 'COURSE_006' });
    });

    it('throws AUTH_003 (403) when the caller does not own the parent course', async () => {
      moduleRepository.findById.mockResolvedValue({
        id: 'module_1',
        course: { instructorId: 'someone_else' },
      } as never);

      await expect(
        service.addLesson('instructor_1', 'module_1', {
          title: 'L1',
          type: 'VIDEO',
        }),
      ).rejects.toMatchObject({ httpStatus: 403, code: 'AUTH_003' });
    });

    it('uses the given order when provided', async () => {
      moduleRepository.findById.mockResolvedValue({
        id: 'module_1',
        course: { instructorId: 'instructor_1' },
      } as never);
      lessonRepository.create.mockResolvedValue({
        id: 'lesson_1',
        moduleId: 'module_1',
        title: 'L1',
        type: 'VIDEO',
        videoUrl: null,
        content: null,
        durationSec: null,
        order: 3,
      } as never);

      await service.addLesson('instructor_1', 'module_1', {
        title: 'L1',
        type: 'VIDEO',
        order: 3,
      });

      expect(lessonRepository.countByModule).not.toHaveBeenCalled();
      expect(lessonRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ moduleId: 'module_1', order: 3 }),
      );
    });

    it('falls back to the current sibling count when order is omitted', async () => {
      moduleRepository.findById.mockResolvedValue({
        id: 'module_1',
        course: { instructorId: 'instructor_1' },
      } as never);
      lessonRepository.countByModule.mockResolvedValue(4);
      lessonRepository.create.mockResolvedValue({
        id: 'lesson_1',
        moduleId: 'module_1',
        title: 'L1',
        type: 'VIDEO',
        videoUrl: null,
        content: null,
        durationSec: null,
        order: 4,
      } as never);

      const result = await service.addLesson('instructor_1', 'module_1', {
        title: 'L1',
        type: 'VIDEO',
      });

      expect(lessonRepository.countByModule).toHaveBeenCalledWith('module_1');
      expect(result.order).toBe(4);
    });
  });
});
