import { LessonQuizzesController } from '../controllers/lesson-quizzes.controller';
import { QuizzesService } from '../services/quizzes.service';

describe('LessonQuizzesController', () => {
  let controller: LessonQuizzesController;
  let quizzesService: jest.Mocked<Pick<QuizzesService, 'generateFromLesson'>>;

  beforeEach(() => {
    quizzesService = {
      generateFromLesson: jest.fn(),
    };
    controller = new LessonQuizzesController(
      quizzesService as unknown as QuizzesService,
    );
  });

  describe('generate', () => {
    it('delegates to quizzesService.generateFromLesson with the current instructor, lesson id, and body', async () => {
      quizzesService.generateFromLesson.mockResolvedValue({
        id: 'quiz_1',
      } as never);

      const result = await controller.generate('instructor_1', 'lesson_1', {
        questionCount: 3,
      });

      expect(quizzesService.generateFromLesson).toHaveBeenCalledWith(
        'instructor_1',
        'lesson_1',
        { questionCount: 3 },
      );
      expect(result).toEqual({ id: 'quiz_1' });
    });
  });
});
