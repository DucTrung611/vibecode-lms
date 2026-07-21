import { PrismaService } from '../../../core/database/prisma.service';
import { AssignmentSubmissionRepository } from '../repositories/assignment-submission.repository';

describe('AssignmentSubmissionRepository', () => {
  let repository: AssignmentSubmissionRepository;
  let prisma: {
    assignmentSubmission: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
    };
  };

  const fakeSubmission = { id: 'sub_1' };

  beforeEach(() => {
    prisma = {
      assignmentSubmission: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };
    repository = new AssignmentSubmissionRepository(
      prisma as unknown as PrismaService,
    );
  });

  describe('findById', () => {
    it('queries by id', async () => {
      prisma.assignmentSubmission.findUnique.mockResolvedValue(fakeSubmission);

      const result = await repository.findById('sub_1');

      expect(prisma.assignmentSubmission.findUnique).toHaveBeenCalledWith({
        where: { id: 'sub_1' },
      });
      expect(result).toBe(fakeSubmission);
    });
  });

  describe('findByAssignmentAndStudent', () => {
    it('queries by the compound unique key', async () => {
      prisma.assignmentSubmission.findUnique.mockResolvedValue(fakeSubmission);

      const result = await repository.findByAssignmentAndStudent(
        'asg_1',
        'student_1',
      );

      expect(prisma.assignmentSubmission.findUnique).toHaveBeenCalledWith({
        where: {
          assignmentId_studentId: {
            assignmentId: 'asg_1',
            studentId: 'student_1',
          },
        },
      });
      expect(result).toBe(fakeSubmission);
    });
  });

  describe('create', () => {
    it('passes data straight through to prisma', async () => {
      prisma.assignmentSubmission.create.mockResolvedValue(fakeSubmission);
      const data = {
        assignmentId: 'asg_1',
        studentId: 'student_1',
        content: 'hi',
      };

      const result = await repository.create(data);

      expect(prisma.assignmentSubmission.create).toHaveBeenCalledWith({ data });
      expect(result).toBe(fakeSubmission);
    });
  });

  describe('grade', () => {
    it('sets score, feedback, gradedById, and gradedAt to now', async () => {
      prisma.assignmentSubmission.update.mockResolvedValue(fakeSubmission);

      const result = await repository.grade('sub_1', {
        score: 90,
        feedback: 'Great work',
        gradedById: 'instructor_1',
      });

      expect(prisma.assignmentSubmission.update).toHaveBeenCalledWith({
        where: { id: 'sub_1' },
        data: {
          score: 90,
          feedback: 'Great work',
          gradedById: 'instructor_1',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          gradedAt: expect.any(Date),
        },
      });
      expect(result).toBe(fakeSubmission);
    });
  });

  describe('findByAssignment', () => {
    it('paginates and includes the student summary, most recent first', async () => {
      prisma.assignmentSubmission.findMany.mockResolvedValue([fakeSubmission]);
      prisma.assignmentSubmission.count.mockResolvedValue(1);

      const result = await repository.findByAssignment('asg_1', 2, 10);

      expect(prisma.assignmentSubmission.findMany).toHaveBeenCalledWith({
        where: { assignmentId: 'asg_1' },
        include: { student: { select: { id: true, fullName: true } } },
        orderBy: { submittedAt: 'desc' },
        skip: 10,
        take: 10,
      });
      expect(prisma.assignmentSubmission.count).toHaveBeenCalledWith({
        where: { assignmentId: 'asg_1' },
      });
      expect(result).toEqual({ items: [fakeSubmission], total: 1 });
    });
  });
});
