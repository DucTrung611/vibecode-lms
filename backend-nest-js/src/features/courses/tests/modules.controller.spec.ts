import { ModulesController } from '../controllers/modules.controller';
import { CoursesService } from '../services/courses.service';

describe('ModulesController', () => {
  let controller: ModulesController;
  let coursesService: jest.Mocked<Pick<CoursesService, 'addLesson'>>;

  beforeEach(() => {
    coursesService = {
      addLesson: jest.fn(),
    };
    controller = new ModulesController(
      coursesService as unknown as CoursesService,
    );
  });

  describe('addLesson', () => {
    it('delegates to coursesService.addLesson with instructor, module id, and DTO', async () => {
      const dto = { title: 'Lesson 1', type: 'VIDEO' as const };
      coursesService.addLesson.mockResolvedValue({ id: 'lesson_1' } as never);

      const result = await controller.addLesson(
        'instructor_1',
        'module_1',
        dto,
      );

      expect(coursesService.addLesson).toHaveBeenCalledWith(
        'instructor_1',
        'module_1',
        dto,
      );
      expect(result).toEqual({ id: 'lesson_1' });
    });
  });
});
