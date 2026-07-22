import { Lesson } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { LessonRepository } from '../repositories/lesson.repository';

describe('LessonRepository', () => {
  let repository: LessonRepository;
  let prisma: {
    lesson: {
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  const fakeLesson = { id: 'lesson_1' } as Lesson;

  beforeEach(() => {
    prisma = {
      lesson: {
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    repository = new LessonRepository(prisma as unknown as PrismaService);
  });

  describe('countByModule', () => {
    it('counts lessons scoped to a module', async () => {
      prisma.lesson.count.mockResolvedValue(2);

      const result = await repository.countByModule('module_1');

      expect(prisma.lesson.count).toHaveBeenCalledWith({
        where: { moduleId: 'module_1' },
      });
      expect(result).toBe(2);
    });
  });

  describe('create', () => {
    it('passes data straight through to prisma', async () => {
      prisma.lesson.create.mockResolvedValue(fakeLesson);
      const data = {
        moduleId: 'module_1',
        title: 'Lesson 1',
        type: 'VIDEO' as const,
        order: 0,
      };

      const result = await repository.create(data);

      expect(prisma.lesson.create).toHaveBeenCalledWith({ data });
      expect(result).toBe(fakeLesson);
    });
  });

  describe('update', () => {
    it('updates by id with the given partial data', async () => {
      prisma.lesson.update.mockResolvedValue(fakeLesson);
      const data = { title: 'New title' };

      const result = await repository.update('lesson_1', data);

      expect(prisma.lesson.update).toHaveBeenCalledWith({
        where: { id: 'lesson_1' },
        data,
      });
      expect(result).toBe(fakeLesson);
    });
  });
});
