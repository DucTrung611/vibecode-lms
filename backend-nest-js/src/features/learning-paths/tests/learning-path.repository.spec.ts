import { LearningPath } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { LearningPathRepository } from '../repositories/learning-path.repository';

describe('LearningPathRepository', () => {
  let repository: LearningPathRepository;
  let prisma: {
    learningPath: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  const fakePath = { id: 'path_1' } as LearningPath;
  const listInclude = {
    items: { include: { course: true }, orderBy: { order: 'asc' as const } },
  };

  beforeEach(() => {
    prisma = {
      learningPath: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    repository = new LearningPathRepository(prisma as unknown as PrismaService);
  });

  describe('findMany', () => {
    it('paginates and includes items with their course, ordered by item order', async () => {
      prisma.learningPath.findMany.mockResolvedValue([fakePath]);
      prisma.learningPath.count.mockResolvedValue(1);

      const result = await repository.findMany(2, 10);

      expect(prisma.learningPath.findMany).toHaveBeenCalledWith({
        include: listInclude,
        skip: 10,
        take: 10,
      });
      expect(prisma.learningPath.count).toHaveBeenCalledWith();
      expect(result).toEqual({ items: [fakePath], total: 1 });
    });
  });

  describe('findById', () => {
    it('queries by id', async () => {
      prisma.learningPath.findUnique.mockResolvedValue(fakePath);

      const result = await repository.findById('path_1');

      expect(prisma.learningPath.findUnique).toHaveBeenCalledWith({
        where: { id: 'path_1' },
      });
      expect(result).toBe(fakePath);
    });
  });
});
