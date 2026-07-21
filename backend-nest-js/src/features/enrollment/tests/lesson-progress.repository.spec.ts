import { LessonProgress } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { LessonProgressRepository } from '../repositories/lesson-progress.repository';

describe('LessonProgressRepository', () => {
  let repository: LessonProgressRepository;
  let prisma: {
    lessonProgress: {
      upsert: jest.Mock;
      findMany: jest.Mock;
    };
  };

  const fakeProgress = { id: 'progress_1' } as LessonProgress;

  beforeEach(() => {
    prisma = {
      lessonProgress: {
        upsert: jest.fn(),
        findMany: jest.fn(),
      },
    };
    repository = new LessonProgressRepository(
      prisma as unknown as PrismaService,
    );
  });

  describe('upsert', () => {
    it('creates with defaults when no prior row exists (defaults applied)', async () => {
      prisma.lessonProgress.upsert.mockResolvedValue(fakeProgress);

      await repository.upsert('enr_1', 'lesson_1', {});

      expect(prisma.lessonProgress.upsert).toHaveBeenCalledWith({
        where: {
          enrollmentId_lessonId: {
            enrollmentId: 'enr_1',
            lessonId: 'lesson_1',
          },
        },
        create: {
          enrollmentId: 'enr_1',
          lessonId: 'lesson_1',
          status: 'IN_PROGRESS',
          watchedSeconds: 0,
          completedAt: null,
        },
        update: {},
      });
    });

    it('only includes explicitly provided fields in the update clause', async () => {
      prisma.lessonProgress.upsert.mockResolvedValue(fakeProgress);

      await repository.upsert('enr_1', 'lesson_1', {
        status: 'COMPLETED',
        watchedSeconds: 120,
        completedAt: new Date('2026-01-01'),
      });

      expect(prisma.lessonProgress.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: {
            status: 'COMPLETED',
            watchedSeconds: 120,
            completedAt: new Date('2026-01-01'),
          },
        }),
      );
    });

    it('resets completedAt to null in the update clause when explicitly passed null', async () => {
      prisma.lessonProgress.upsert.mockResolvedValue(fakeProgress);

      await repository.upsert('enr_1', 'lesson_1', {
        status: 'IN_PROGRESS',
        completedAt: null,
      });

      expect(prisma.lessonProgress.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: { status: 'IN_PROGRESS', completedAt: null },
        }),
      );
    });
  });

  describe('findCompletedLessonIds', () => {
    it('returns the lesson ids of completed progress rows for the enrollment', async () => {
      prisma.lessonProgress.findMany.mockResolvedValue([
        { lessonId: 'lesson_1' },
        { lessonId: 'lesson_2' },
      ]);

      const result = await repository.findCompletedLessonIds('enr_1');

      expect(prisma.lessonProgress.findMany).toHaveBeenCalledWith({
        where: { enrollmentId: 'enr_1', status: 'COMPLETED' },
        select: { lessonId: true },
      });
      expect(result).toEqual(['lesson_1', 'lesson_2']);
    });
  });
});
