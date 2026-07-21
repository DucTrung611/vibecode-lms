import { EnrollController } from '../controllers/enroll.controller';
import { EnrollmentService } from '../services/enrollment.service';

describe('EnrollController', () => {
  let controller: EnrollController;
  let enrollmentService: jest.Mocked<Pick<EnrollmentService, 'enroll'>>;

  beforeEach(() => {
    enrollmentService = {
      enroll: jest.fn(),
    };
    controller = new EnrollController(
      enrollmentService as unknown as EnrollmentService,
    );
  });

  describe('enroll', () => {
    it('delegates to enrollmentService.enroll and maps the response to {enrollmentId, status}', async () => {
      enrollmentService.enroll.mockResolvedValue({
        id: 'enr_1',
        status: 'ACTIVE',
      } as never);

      const result = await controller.enroll('student_1', 'course_1');

      expect(enrollmentService.enroll).toHaveBeenCalledWith(
        'student_1',
        'course_1',
      );
      expect(result).toEqual({ enrollmentId: 'enr_1', status: 'ACTIVE' });
    });
  });
});
