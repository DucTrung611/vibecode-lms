import { LessonQuestionsController } from '../controllers/lesson-questions.controller';
import { DiscussionsService } from '../services/discussions.service';

describe('LessonQuestionsController', () => {
  let controller: LessonQuestionsController;
  let discussionsService: jest.Mocked<
    Pick<DiscussionsService, 'findByLesson' | 'createQuestion'>
  >;

  beforeEach(() => {
    discussionsService = {
      findByLesson: jest.fn(),
      createQuestion: jest.fn(),
    };
    controller = new LessonQuestionsController(
      discussionsService as unknown as DiscussionsService,
    );
  });

  describe('findByLesson', () => {
    it('delegates to discussionsService.findByLesson with user, lesson id, and query', async () => {
      discussionsService.findByLesson.mockResolvedValue({
        items: [],
        meta: { page: 1, limit: 20, total: 0 },
      });

      const result = await controller.findByLesson(
        'student_1',
        'STUDENT',
        'lesson_1',
        { page: 2, limit: 5 },
      );

      expect(discussionsService.findByLesson).toHaveBeenCalledWith(
        'student_1',
        'STUDENT',
        'lesson_1',
        2,
        5,
      );
      expect(result).toEqual({
        items: [],
        meta: { page: 1, limit: 20, total: 0 },
      });
    });
  });

  describe('createQuestion', () => {
    it('delegates to discussionsService.createQuestion with student, lesson id, and DTO', async () => {
      const dto = { content: 'How does this work?' };
      discussionsService.createQuestion.mockResolvedValue({ id: 'question_1' } as never);

      const result = await controller.createQuestion('student_1', 'lesson_1', dto);

      expect(discussionsService.createQuestion).toHaveBeenCalledWith(
        'student_1',
        'lesson_1',
        dto,
      );
      expect(result).toEqual({ id: 'question_1' });
    });
  });
});
