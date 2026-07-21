import { EnrollmentsController } from '../controllers/enrollments.controller';
import { EnrollmentService } from '../services/enrollment.service';

describe('EnrollmentsController', () => {
  let controller: EnrollmentsController;
  let enrollmentService: jest.Mocked<
    Pick<EnrollmentService, 'findMyEnrollments' | 'updateProgress'>
  >;

  beforeEach(() => {
    enrollmentService = {
      findMyEnrollments: jest.fn(),
      updateProgress: jest.fn(),
    };
    controller = new EnrollmentsController(
      enrollmentService as unknown as EnrollmentService,
    );
  });

  describe('findMine', () => {
    it('delegates to enrollmentService.findMyEnrollments with the current student and query', async () => {
      enrollmentService.findMyEnrollments.mockResolvedValue({
        items: [],
        meta: { page: 1, limit: 20, total: 0 },
      });

      const result = await controller.findMine('student_1', {
        page: 2,
        limit: 5,
      });

      expect(enrollmentService.findMyEnrollments).toHaveBeenCalledWith(
        'student_1',
        2,
        5,
      );
      expect(result).toEqual({
        items: [],
        meta: { page: 1, limit: 20, total: 0 },
      });
    });
  });

  describe('updateProgress', () => {
    it('delegates to enrollmentService.updateProgress with student, enrollment id, and DTO', async () => {
      const dto = { lessonId: 'lesson_1' };
      enrollmentService.updateProgress.mockResolvedValue({
        id: 'progress_1',
      } as never);

      const result = await controller.updateProgress('student_1', 'enr_1', dto);

      expect(enrollmentService.updateProgress).toHaveBeenCalledWith(
        'student_1',
        'enr_1',
        dto,
      );
      expect(result).toEqual({ id: 'progress_1' });
    });
  });
});
