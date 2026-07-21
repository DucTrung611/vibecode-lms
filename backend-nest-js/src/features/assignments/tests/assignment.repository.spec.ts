import { PrismaService } from '../../../core/database/prisma.service';
import { AssignmentRepository } from '../repositories/assignment.repository';

describe('AssignmentRepository', () => {
  let repository: AssignmentRepository;
  let prisma: { assignment: { findUnique: jest.Mock } };

  const fakeAssignment = { id: 'asg_1' };

  beforeEach(() => {
    prisma = { assignment: { findUnique: jest.fn() } };
    repository = new AssignmentRepository(prisma as unknown as PrismaService);
  });

  describe('findByIdWithCourse', () => {
    it('queries by id including the lesson->module->course path', async () => {
      prisma.assignment.findUnique.mockResolvedValue(fakeAssignment);

      const result = await repository.findByIdWithCourse('asg_1');

      expect(prisma.assignment.findUnique).toHaveBeenCalledWith({
        where: { id: 'asg_1' },
        include: {
          lesson: {
            select: { module: { select: { courseId: true } } },
          },
        },
      });
      expect(result).toBe(fakeAssignment);
    });
  });
});
