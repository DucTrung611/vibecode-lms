import { SubmissionsController } from '../controllers/submissions.controller';
import { AssignmentsService } from '../services/assignments.service';

describe('SubmissionsController', () => {
  let controller: SubmissionsController;
  let assignmentsService: jest.Mocked<
    Pick<AssignmentsService, 'gradeSubmission'>
  >;

  beforeEach(() => {
    assignmentsService = { gradeSubmission: jest.fn() };
    controller = new SubmissionsController(
      assignmentsService as unknown as AssignmentsService,
    );
  });

  describe('grade', () => {
    it('delegates to assignmentsService.gradeSubmission with grader, submission id, and DTO', async () => {
      const dto = { score: 90, feedback: 'Nice' };
      assignmentsService.gradeSubmission.mockResolvedValue({
        id: 'sub_1',
        score: 90,
      } as never);

      const result = await controller.grade('instructor_1', 'sub_1', dto);

      expect(assignmentsService.gradeSubmission).toHaveBeenCalledWith(
        'instructor_1',
        'sub_1',
        dto,
      );
      expect(result).toEqual({ id: 'sub_1', score: 90 });
    });
  });
});
