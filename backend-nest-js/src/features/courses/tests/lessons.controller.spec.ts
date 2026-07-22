import { LessonsController } from '../controllers/lessons.controller';
import { CoursesService } from '../services/courses.service';

describe('LessonsController', () => {
  let controller: LessonsController;
  let coursesService: jest.Mocked<Pick<CoursesService, 'updateLesson'>>;

  beforeEach(() => {
    coursesService = {
      updateLesson: jest.fn(),
    };
    controller = new LessonsController(
      coursesService as unknown as CoursesService,
    );
  });

  describe('update', () => {
    it('delegates to coursesService.updateLesson with instructor, lesson id, and DTO', async () => {
      const dto = { title: 'Updated title' };
      coursesService.updateLesson.mockResolvedValue({
        id: 'lesson_1',
      } as never);

      const result = await controller.update('instructor_1', 'lesson_1', dto);

      expect(coursesService.updateLesson).toHaveBeenCalledWith(
        'instructor_1',
        'lesson_1',
        dto,
      );
      expect(result).toEqual({ id: 'lesson_1' });
    });
  });
});
