import { Category } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { CategoryRepository } from '../repositories/category.repository';

describe('CategoryRepository', () => {
  let repository: CategoryRepository;
  let prisma: {
    category: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };

  const fakeCategory = {
    id: 'cat_1',
    name: 'Programming',
    slug: 'programming',
    parentId: null,
  } as Category;

  beforeEach(() => {
    prisma = {
      category: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };
    repository = new CategoryRepository(prisma as unknown as PrismaService);
  });

  describe('findMany', () => {
    it('lists all categories ordered by name', async () => {
      prisma.category.findMany.mockResolvedValue([fakeCategory]);

      const result = await repository.findMany();

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual([fakeCategory]);
    });
  });

  describe('findById', () => {
    it('queries by id', async () => {
      prisma.category.findUnique.mockResolvedValue(fakeCategory);

      const result = await repository.findById('cat_1');

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'cat_1' },
      });
      expect(result).toBe(fakeCategory);
    });
  });

  describe('findBySlug', () => {
    it('queries by slug', async () => {
      prisma.category.findUnique.mockResolvedValue(fakeCategory);

      const result = await repository.findBySlug('programming');

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { slug: 'programming' },
      });
      expect(result).toBe(fakeCategory);
    });
  });

  describe('create', () => {
    it('passes data straight through to prisma', async () => {
      prisma.category.create.mockResolvedValue(fakeCategory);
      const data = { name: 'Programming', slug: 'programming' };

      const result = await repository.create(data);

      expect(prisma.category.create).toHaveBeenCalledWith({ data });
      expect(result).toBe(fakeCategory);
    });
  });
});
