import { Course } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { CourseRepository } from '../repositories/course.repository';

describe('CourseRepository', () => {
  let repository: CourseRepository;
  let prisma: {
    course: {
      findMany: jest.Mock;
      count: jest.Mock;
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    category: {
      findUnique: jest.Mock;
    };
  };

  const fakeCourse = { id: 'course_1' } as Course;

  beforeEach(() => {
    prisma = {
      course: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      category: {
        findUnique: jest.fn(),
      },
    };
    repository = new CourseRepository(prisma as unknown as PrismaService);
  });

  describe('findMany', () => {
    it('builds a where clause from all provided filters', async () => {
      prisma.course.findMany.mockResolvedValue([fakeCourse]);
      prisma.course.count.mockResolvedValue(1);

      const result = await repository.findMany({
        page: 2,
        limit: 10,
        sortBy: 'title',
        order: 'asc',
        status: 'PUBLISHED',
        categoryId: 'cat_1',
        level: 'BEGINNER',
      });

      const expectedWhere = {
        deletedAt: null,
        status: 'PUBLISHED',
        categoryId: 'cat_1',
        level: 'BEGINNER',
      };
      expect(prisma.course.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        orderBy: { title: 'asc' },
        skip: 10,
        take: 10,
      });
      expect(prisma.course.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
      expect(result).toEqual({ items: [fakeCourse], total: 1 });
    });

    it('omits optional filters entirely when not provided', async () => {
      prisma.course.findMany.mockResolvedValue([]);
      prisma.course.count.mockResolvedValue(0);

      await repository.findMany({
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        order: 'desc',
      });

      expect(prisma.course.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      });
    });
  });

  describe('findById', () => {
    it('queries a non-deleted course by id', async () => {
      prisma.course.findFirst.mockResolvedValue(fakeCourse);

      const result = await repository.findById('course_1');

      expect(prisma.course.findFirst).toHaveBeenCalledWith({
        where: { id: 'course_1', deletedAt: null },
      });
      expect(result).toBe(fakeCourse);
    });
  });

  describe('findByIdWithDetail', () => {
    it('includes modules and their lessons', async () => {
      prisma.course.findFirst.mockResolvedValue(fakeCourse);

      await repository.findByIdWithDetail('course_1');

      expect(prisma.course.findFirst).toHaveBeenCalledWith({
        where: { id: 'course_1', deletedAt: null },
        include: { modules: { include: { lessons: true } } },
      });
    });
  });

  describe('findBySlug', () => {
    it('queries by unique slug', async () => {
      prisma.course.findUnique.mockResolvedValue(fakeCourse);

      const result = await repository.findBySlug('intro-to-algebra');

      expect(prisma.course.findUnique).toHaveBeenCalledWith({
        where: { slug: 'intro-to-algebra' },
      });
      expect(result).toBe(fakeCourse);
    });
  });

  describe('categoryExists', () => {
    it('returns true when the category is found', async () => {
      prisma.category.findUnique.mockResolvedValue({ id: 'cat_1' });

      const result = await repository.categoryExists('cat_1');

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'cat_1' },
      });
      expect(result).toBe(true);
    });

    it('returns false when the category is not found', async () => {
      prisma.category.findUnique.mockResolvedValue(null);

      const result = await repository.categoryExists('missing');

      expect(result).toBe(false);
    });
  });

  describe('create', () => {
    it('passes data straight through to prisma', async () => {
      prisma.course.create.mockResolvedValue(fakeCourse);
      const data = {
        title: 'Intro',
        slug: 'intro',
        description: 'desc',
        price: 0,
        level: 'BEGINNER' as const,
        instructorId: 'user_1',
      };

      const result = await repository.create(data);

      expect(prisma.course.create).toHaveBeenCalledWith({ data });
      expect(result).toBe(fakeCourse);
    });
  });

  describe('update', () => {
    it('updates by id with the given partial data', async () => {
      prisma.course.update.mockResolvedValue(fakeCourse);
      const data = { title: 'New title' };

      const result = await repository.update('course_1', data);

      expect(prisma.course.update).toHaveBeenCalledWith({
        where: { id: 'course_1' },
        data,
      });
      expect(result).toBe(fakeCourse);
    });
  });

  describe('softDelete', () => {
    it('sets deletedAt to now', async () => {
      prisma.course.update.mockResolvedValue(fakeCourse);

      const result = await repository.softDelete('course_1');

      expect(prisma.course.update).toHaveBeenCalledWith({
        where: { id: 'course_1' },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: { deletedAt: expect.any(Date) },
      });
      expect(result).toBe(fakeCourse);
    });
  });
});
