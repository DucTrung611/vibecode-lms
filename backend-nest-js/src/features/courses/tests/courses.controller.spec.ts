import { CoursesController } from '../controllers/courses.controller';
import { CoursesService } from '../services/courses.service';

describe('CoursesController', () => {
  let controller: CoursesController;
  let coursesService: jest.Mocked<
    Pick<
      CoursesService,
      'findAll' | 'findById' | 'create' | 'update' | 'remove' | 'addModule'
    >
  >;

  beforeEach(() => {
    coursesService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      addModule: jest.fn(),
    };
    controller = new CoursesController(
      coursesService as unknown as CoursesService,
    );
  });

  describe('findAll', () => {
    it('delegates to coursesService.findAll with the query', async () => {
      const query = { page: 1, limit: 20 };
      coursesService.findAll.mockResolvedValue({
        items: [],
        meta: { page: 1, limit: 20, total: 0 },
      });

      const result = await controller.findAll(query);

      expect(coursesService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        items: [],
        meta: { page: 1, limit: 20, total: 0 },
      });
    });
  });

  describe('findOne', () => {
    it('delegates to coursesService.findById with the id', async () => {
      coursesService.findById.mockResolvedValue({ id: 'course_1' } as never);

      const result = await controller.findOne('course_1');

      expect(coursesService.findById).toHaveBeenCalledWith('course_1');
      expect(result).toEqual({ id: 'course_1' });
    });
  });

  describe('create', () => {
    it('delegates to coursesService.create with the current instructor and DTO', async () => {
      const dto = {
        title: 'Intro',
        description: 'desc',
        price: 0,
        level: 'BEGINNER' as const,
      };
      coursesService.create.mockResolvedValue({ id: 'course_1' } as never);

      const result = await controller.create('instructor_1', dto);

      expect(coursesService.create).toHaveBeenCalledWith('instructor_1', dto);
      expect(result).toEqual({ id: 'course_1' });
    });
  });

  describe('update', () => {
    it('delegates to coursesService.update with instructor, id, and DTO', async () => {
      const dto = { title: 'New title' };
      coursesService.update.mockResolvedValue({ id: 'course_1' } as never);

      const result = await controller.update('instructor_1', 'course_1', dto);

      expect(coursesService.update).toHaveBeenCalledWith(
        'instructor_1',
        'course_1',
        dto,
      );
      expect(result).toEqual({ id: 'course_1' });
    });
  });

  describe('remove', () => {
    it('delegates to coursesService.remove with instructor and id', async () => {
      coursesService.remove.mockResolvedValue(undefined);

      await controller.remove('instructor_1', 'course_1');

      expect(coursesService.remove).toHaveBeenCalledWith(
        'instructor_1',
        'course_1',
      );
    });
  });

  describe('addModule', () => {
    it('delegates to coursesService.addModule with instructor, id, and DTO', async () => {
      const dto = { title: 'Module 1' };
      coursesService.addModule.mockResolvedValue({ id: 'module_1' } as never);

      const result = await controller.addModule(
        'instructor_1',
        'course_1',
        dto,
      );

      expect(coursesService.addModule).toHaveBeenCalledWith(
        'instructor_1',
        'course_1',
        dto,
      );
      expect(result).toEqual({ id: 'module_1' });
    });
  });
});
