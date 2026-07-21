import { ReviewsController } from '../controllers/reviews.controller';
import { ReviewsService } from '../services/reviews.service';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let reviewsService: jest.Mocked<
    Pick<ReviewsService, 'findByCourse' | 'create'>
  >;

  beforeEach(() => {
    reviewsService = {
      findByCourse: jest.fn(),
      create: jest.fn(),
    };
    controller = new ReviewsController(
      reviewsService as unknown as ReviewsService,
    );
  });

  describe('findByCourse', () => {
    it('delegates to reviewsService.findByCourse with the course id and query', async () => {
      reviewsService.findByCourse.mockResolvedValue({
        items: [],
        meta: { page: 1, limit: 20, total: 0 },
      });

      const result = await controller.findByCourse('course_1', {
        page: 2,
        limit: 5,
      });

      expect(reviewsService.findByCourse).toHaveBeenCalledWith(
        'course_1',
        2,
        5,
      );
      expect(result).toEqual({
        items: [],
        meta: { page: 1, limit: 20, total: 0 },
      });
    });
  });

  describe('create', () => {
    it('delegates to reviewsService.create with student, course id, and DTO', async () => {
      const dto = { rating: 5, comment: 'Great course' };
      reviewsService.create.mockResolvedValue({ id: 'rev_1' } as never);

      const result = await controller.create('student_1', 'course_1', dto);

      expect(reviewsService.create).toHaveBeenCalledWith(
        'student_1',
        'course_1',
        dto,
      );
      expect(result).toEqual({ id: 'rev_1' });
    });
  });
});
