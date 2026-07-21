import { CategoriesController } from '../controllers/categories.controller';
import { CategoriesService } from '../services/categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let categoriesService: jest.Mocked<
    Pick<CategoriesService, 'findAll' | 'create'>
  >;

  beforeEach(() => {
    categoriesService = {
      findAll: jest.fn(),
      create: jest.fn(),
    };
    controller = new CategoriesController(
      categoriesService as unknown as CategoriesService,
    );
  });

  describe('findAll', () => {
    it('delegates to categoriesService.findAll', async () => {
      categoriesService.findAll.mockResolvedValue([{ id: 'cat_1' } as never]);

      const result = await controller.findAll();

      expect(categoriesService.findAll).toHaveBeenCalledWith();
      expect(result).toEqual([{ id: 'cat_1' }]);
    });
  });

  describe('create', () => {
    it('delegates to categoriesService.create with the body', async () => {
      categoriesService.create.mockResolvedValue({ id: 'cat_1' } as never);

      const result = await controller.create({ name: 'Programming' });

      expect(categoriesService.create).toHaveBeenCalledWith({
        name: 'Programming',
      });
      expect(result).toEqual({ id: 'cat_1' });
    });
  });
});
