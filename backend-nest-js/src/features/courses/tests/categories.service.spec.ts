import { Category } from '@prisma/client';
import { CategoryRepository } from '../repositories/category.repository';
import { CategoriesService } from '../services/categories.service';
import * as slugUtil from '../utils/slug.util';

jest.mock('../utils/slug.util');

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoryRepository: jest.Mocked<
    Pick<CategoryRepository, 'findMany' | 'findById' | 'findBySlug' | 'create'>
  >;

  const slugify = slugUtil.slugify as jest.Mock;
  const withRandomSuffix = slugUtil.withRandomSuffix as jest.Mock;

  const fakeCategory: Category = {
    id: 'cat_1',
    name: 'Programming',
    slug: 'programming',
    parentId: null,
  };

  beforeEach(() => {
    categoryRepository = {
      findMany: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      create: jest.fn(),
    };
    slugify.mockImplementation((name: string) =>
      name.toLowerCase().replace(/\s+/g, '-'),
    );
    withRandomSuffix.mockImplementation((base: string) => `${base}-abc123`);

    service = new CategoriesService(
      categoryRepository as unknown as CategoryRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('maps every category', async () => {
      categoryRepository.findMany.mockResolvedValue([fakeCategory]);

      const result = await service.findAll();

      expect(result).toEqual([
        {
          id: 'cat_1',
          name: 'Programming',
          slug: 'programming',
          parentId: null,
        },
      ]);
    });
  });

  describe('create', () => {
    it('throws COURSE_005 (404) when parentId is provided but does not exist', async () => {
      categoryRepository.findById.mockResolvedValue(null);

      await expect(
        service.create({ name: 'Web Dev', parentId: 'missing' }),
      ).rejects.toMatchObject({ httpStatus: 404, code: 'COURSE_005' });
      expect(categoryRepository.create).not.toHaveBeenCalled();
    });

    it('uses the plain slug when it is not already taken', async () => {
      categoryRepository.findBySlug.mockResolvedValue(null);
      categoryRepository.create.mockResolvedValue(fakeCategory);

      await service.create({ name: 'Programming' });

      expect(categoryRepository.create).toHaveBeenCalledWith({
        name: 'Programming',
        slug: 'programming',
        parentId: undefined,
      });
    });

    it('appends a random suffix when the base slug is already taken', async () => {
      categoryRepository.findBySlug
        .mockResolvedValueOnce(fakeCategory)
        .mockResolvedValueOnce(null);
      categoryRepository.create.mockResolvedValue(fakeCategory);

      await service.create({ name: 'Programming' });

      expect(categoryRepository.create).toHaveBeenCalledWith({
        name: 'Programming',
        slug: 'programming-abc123',
        parentId: undefined,
      });
    });

    it('validates the parent exists before creating a child category', async () => {
      categoryRepository.findById.mockResolvedValue(fakeCategory);
      categoryRepository.findBySlug.mockResolvedValue(null);
      categoryRepository.create.mockResolvedValue({
        ...fakeCategory,
        id: 'cat_2',
        parentId: 'cat_1',
      });

      const result = await service.create({
        name: 'Web Dev',
        parentId: 'cat_1',
      });

      expect(categoryRepository.findById).toHaveBeenCalledWith('cat_1');
      expect(result.parentId).toBe('cat_1');
    });
  });
});
