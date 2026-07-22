import { QuestionAnswersController } from '../controllers/question-answers.controller';
import { DiscussionsService } from '../services/discussions.service';

describe('QuestionAnswersController', () => {
  let controller: QuestionAnswersController;
  let discussionsService: jest.Mocked<Pick<DiscussionsService, 'createAnswer'>>;

  beforeEach(() => {
    discussionsService = { createAnswer: jest.fn() };
    controller = new QuestionAnswersController(
      discussionsService as unknown as DiscussionsService,
    );
  });

  describe('createAnswer', () => {
    it('delegates to discussionsService.createAnswer with user, question id, and DTO', async () => {
      const dto = { content: 'Here is how.' };
      discussionsService.createAnswer.mockResolvedValue({ id: 'answer_1' } as never);

      const result = await controller.createAnswer(
        'instructor_1',
        'INSTRUCTOR',
        'question_1',
        dto,
      );

      expect(discussionsService.createAnswer).toHaveBeenCalledWith(
        'instructor_1',
        'INSTRUCTOR',
        'question_1',
        dto,
      );
      expect(result).toEqual({ id: 'answer_1' });
    });
  });
});
