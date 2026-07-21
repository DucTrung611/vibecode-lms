import { AssignmentsController } from '../controllers/assignments.controller';
import { AssignmentsService } from '../services/assignments.service';

describe('AssignmentsController', () => {
  let controller: AssignmentsController;
  let assignmentsService: jest.Mocked<
    Pick<AssignmentsService, 'findById' | 'submit' | 'findSubmissions'>
  >;

  beforeEach(() => {
    assignmentsService = {
      findById: jest.fn(),
      submit: jest.fn(),
      findSubmissions: jest.fn(),
    };
    controller = new AssignmentsController(
      assignmentsService as unknown as AssignmentsService,
    );
  });

  describe('findOne', () => {
    it('delegates to assignmentsService.findById with the current student and assignment id', async () => {
      assignmentsService.findById.mockResolvedValue({ id: 'asg_1' } as never);

      const result = await controller.findOne('student_1', 'asg_1');

      expect(assignmentsService.findById).toHaveBeenCalledWith(
        'student_1',
        'asg_1',
      );
      expect(result).toEqual({ id: 'asg_1' });
    });
  });

  describe('submit', () => {
    it('delegates to assignmentsService.submit with student, assignment id, and DTO', async () => {
      const dto = { content: 'my essay' };
      assignmentsService.submit.mockResolvedValue({ id: 'sub_1' } as never);

      const result = await controller.submit('student_1', 'asg_1', dto);

      expect(assignmentsService.submit).toHaveBeenCalledWith(
        'student_1',
        'asg_1',
        dto,
      );
      expect(result).toEqual({ id: 'sub_1' });
    });
  });

  describe('findSubmissions', () => {
    it('delegates to assignmentsService.findSubmissions with the current instructor, assignment id, and query', async () => {
      assignmentsService.findSubmissions.mockResolvedValue({
        items: [],
        meta: { page: 1, limit: 20, total: 0 },
      });

      const result = await controller.findSubmissions('instructor_1', 'asg_1', {
        page: 2,
        limit: 5,
      });

      expect(assignmentsService.findSubmissions).toHaveBeenCalledWith(
        'instructor_1',
        'asg_1',
        2,
        5,
      );
      expect(result).toEqual({
        items: [],
        meta: { page: 1, limit: 20, total: 0 },
      });
    });
  });
});
