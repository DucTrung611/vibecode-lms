import { QuizzesController } from '../controllers/quizzes.controller';
import { QuizzesService } from '../services/quizzes.service';

describe('QuizzesController', () => {
  let controller: QuizzesController;
  let quizzesService: jest.Mocked<
    Pick<QuizzesService, 'findById' | 'startAttempt'>
  >;

  beforeEach(() => {
    quizzesService = {
      findById: jest.fn(),
      startAttempt: jest.fn(),
    };
    controller = new QuizzesController(
      quizzesService as unknown as QuizzesService,
    );
  });

  describe('findOne', () => {
    it('delegates to quizzesService.findById with the current student and quiz id', async () => {
      quizzesService.findById.mockResolvedValue({ id: 'quiz_1' } as never);

      const result = await controller.findOne('student_1', 'quiz_1');

      expect(quizzesService.findById).toHaveBeenCalledWith(
        'student_1',
        'quiz_1',
      );
      expect(result).toEqual({ id: 'quiz_1' });
    });
  });

  describe('startAttempt', () => {
    it('delegates to quizzesService.startAttempt with the current student and quiz id', async () => {
      quizzesService.startAttempt.mockResolvedValue({ id: 'att_1' } as never);

      const result = await controller.startAttempt('student_1', 'quiz_1');

      expect(quizzesService.startAttempt).toHaveBeenCalledWith(
        'student_1',
        'quiz_1',
      );
      expect(result).toEqual({ id: 'att_1' });
    });
  });
});
