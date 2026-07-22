import { InstructorsController } from '../controllers/instructors.controller';
import { InstructorsService } from '../services/instructors.service';

describe('InstructorsController', () => {
  let controller: InstructorsController;
  let instructorsService: jest.Mocked<
    Pick<InstructorsService, 'getProfile' | 'getCourses'>
  >;

  beforeEach(() => {
    instructorsService = {
      getProfile: jest.fn(),
      getCourses: jest.fn(),
    };
    controller = new InstructorsController(
      instructorsService as unknown as InstructorsService,
    );
  });

  describe('getProfile', () => {
    it('delegates to instructorsService.getProfile with the id param', async () => {
      instructorsService.getProfile.mockResolvedValue({ id: 'instructor_1' } as never);

      const result = await controller.getProfile('instructor_1');

      expect(instructorsService.getProfile).toHaveBeenCalledWith('instructor_1');
      expect(result).toEqual({ id: 'instructor_1' });
    });
  });

  describe('getCourses', () => {
    it('normalizes pagination and delegates to instructorsService.getCourses', async () => {
      instructorsService.getCourses.mockResolvedValue({
        items: [],
        meta: { page: 1, limit: 20, total: 0 },
      });

      await controller.getCourses('instructor_1', {});

      expect(instructorsService.getCourses).toHaveBeenCalledWith(
        'instructor_1',
        1,
        20,
      );
    });

    it('forwards explicit page/limit query params', async () => {
      instructorsService.getCourses.mockResolvedValue({
        items: [],
        meta: { page: 2, limit: 5, total: 0 },
      });

      await controller.getCourses('instructor_1', { page: 2, limit: 5 });

      expect(instructorsService.getCourses).toHaveBeenCalledWith(
        'instructor_1',
        2,
        5,
      );
    });
  });
});
