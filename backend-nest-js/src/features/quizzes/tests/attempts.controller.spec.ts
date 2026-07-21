import { AttemptsController } from '../controllers/attempts.controller';
import { QuizzesService } from '../services/quizzes.service';

describe('AttemptsController', () => {
  let controller: AttemptsController;
  let quizzesService: jest.Mocked<Pick<QuizzesService, 'submitAttempt'>>;

  beforeEach(() => {
    quizzesService = { submitAttempt: jest.fn() };
    controller = new AttemptsController(
      quizzesService as unknown as QuizzesService,
    );
  });

  describe('submit', () => {
    it('delegates to quizzesService.submitAttempt with student, attempt id, and DTO', async () => {
      const dto = {
        answers: [{ questionId: 'q_1', selectedOptionId: 'opt_2' }],
      };
      quizzesService.submitAttempt.mockResolvedValue({
        attemptId: 'att_1',
        score: 100,
        passed: true,
        answers: [{ questionId: 'q_1', isCorrect: true }],
      });

      const result = await controller.submit('student_1', 'att_1', dto);

      expect(quizzesService.submitAttempt).toHaveBeenCalledWith(
        'student_1',
        'att_1',
        dto,
      );
      expect(result).toEqual({
        attemptId: 'att_1',
        score: 100,
        passed: true,
        answers: [{ questionId: 'q_1', isCorrect: true }],
      });
    });
  });
});
