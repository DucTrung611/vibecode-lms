import { PrismaService } from '../../../core/database/prisma.service';
import { QuizRepository } from '../repositories/quiz.repository';

describe('QuizRepository', () => {
  let repository: QuizRepository;
  let prisma: { quiz: { findUnique: jest.Mock } };

  const fakeQuiz = { id: 'quiz_1' };

  beforeEach(() => {
    prisma = { quiz: { findUnique: jest.fn() } };
    repository = new QuizRepository(prisma as unknown as PrismaService);
  });

  describe('findByIdWithQuestions', () => {
    it('queries by id including ordered questions/options and the lesson->course path', async () => {
      prisma.quiz.findUnique.mockResolvedValue(fakeQuiz);

      const result = await repository.findByIdWithQuestions('quiz_1');

      expect(prisma.quiz.findUnique).toHaveBeenCalledWith({
        where: { id: 'quiz_1' },
        include: {
          questions: {
            include: { options: true },
            orderBy: { order: 'asc' },
          },
          lesson: {
            select: { module: { select: { courseId: true } } },
          },
        },
      });
      expect(result).toBe(fakeQuiz);
    });
  });
});
