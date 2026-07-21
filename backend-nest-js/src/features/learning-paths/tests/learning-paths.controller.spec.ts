import { LearningPathsController } from '../controllers/learning-paths.controller';
import { LearningPathsService } from '../services/learning-paths.service';

describe('LearningPathsController', () => {
  let controller: LearningPathsController;
  let learningPathsService: jest.Mocked<
    Pick<LearningPathsService, 'findAll' | 'enroll'>
  >;

  beforeEach(() => {
    learningPathsService = {
      findAll: jest.fn(),
      enroll: jest.fn(),
    };
    controller = new LearningPathsController(
      learningPathsService as unknown as LearningPathsService,
    );
  });

  describe('findAll', () => {
    it('delegates to learningPathsService.findAll with the query', async () => {
      learningPathsService.findAll.mockResolvedValue({
        items: [],
        meta: { page: 1, limit: 20, total: 0 },
      });

      const result = await controller.findAll({ page: 2, limit: 5 });

      expect(learningPathsService.findAll).toHaveBeenCalledWith(2, 5);
      expect(result).toEqual({
        items: [],
        meta: { page: 1, limit: 20, total: 0 },
      });
    });
  });

  describe('enroll', () => {
    it('delegates to learningPathsService.enroll with the current student and path id', async () => {
      learningPathsService.enroll.mockResolvedValue({ id: 'lpe_1' } as never);

      const result = await controller.enroll('student_1', 'path_1');

      expect(learningPathsService.enroll).toHaveBeenCalledWith(
        'student_1',
        'path_1',
      );
      expect(result).toEqual({ id: 'lpe_1' });
    });
  });
});
