import { PrismaService } from '../../../core/database/prisma.service';
import { QuizAttemptRepository } from '../repositories/quiz-attempt.repository';

describe('QuizAttemptRepository', () => {
  let repository: QuizAttemptRepository;
  let prisma: {
    quizAttempt: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    quizAnswer: { createMany: jest.Mock };
    $transaction: jest.Mock;
  };

  const fakeAttempt = { id: 'att_1' };

  beforeEach(() => {
    prisma = {
      quizAttempt: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      quizAnswer: { createMany: jest.fn() },
      $transaction: jest.fn(),
    };
    repository = new QuizAttemptRepository(prisma as unknown as PrismaService);
  });

  describe('findById', () => {
    it('queries by id', async () => {
      prisma.quizAttempt.findUnique.mockResolvedValue(fakeAttempt);

      const result = await repository.findById('att_1');

      expect(prisma.quizAttempt.findUnique).toHaveBeenCalledWith({
        where: { id: 'att_1' },
      });
      expect(result).toBe(fakeAttempt);
    });
  });

  describe('create', () => {
    it('passes data straight through to prisma', async () => {
      prisma.quizAttempt.create.mockResolvedValue(fakeAttempt);
      const data = { quizId: 'quiz_1', studentId: 'student_1' };

      const result = await repository.create(data);

      expect(prisma.quizAttempt.create).toHaveBeenCalledWith({ data });
      expect(result).toBe(fakeAttempt);
    });
  });

  describe('submit', () => {
    it('creates the answer rows and updates the attempt score/submittedAt in one transaction', async () => {
      prisma.$transaction.mockResolvedValue([{ count: 1 }, fakeAttempt]);

      const result = await repository.submit('att_1', {
        score: 80,
        answers: [
          {
            questionId: 'q_1',
            isCorrect: true,
            pointsEarned: 10,
            selectedOptionId: 'opt_1',
          },
        ],
      });

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.quizAnswer.createMany).toHaveBeenCalledWith({
        data: [
          {
            attemptId: 'att_1',
            questionId: 'q_1',
            selectedOptionId: 'opt_1',
            answerText: undefined,
            isCorrect: true,
          },
        ],
      });
      expect(prisma.quizAttempt.update).toHaveBeenCalledWith({
        where: { id: 'att_1' },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: { score: 80, submittedAt: expect.any(Date) },
      });
      expect(result).toBe(fakeAttempt);
    });
  });
});
