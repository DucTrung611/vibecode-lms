import { LessonAnswer, LessonQuestion } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { DiscussionRepository } from '../repositories/discussion.repository';

describe('DiscussionRepository', () => {
  let repository: DiscussionRepository;
  let prisma: {
    lessonQuestion: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
    };
    lessonAnswer: {
      create: jest.Mock;
    };
  };

  const fakeQuestion = { id: 'question_1' } as LessonQuestion;
  const fakeAnswer = { id: 'answer_1' } as LessonAnswer;

  beforeEach(() => {
    prisma = {
      lessonQuestion: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      lessonAnswer: {
        create: jest.fn(),
      },
    };
    repository = new DiscussionRepository(prisma as unknown as PrismaService);
  });

  describe('findByLessonWithAnswers', () => {
    it('lists questions for a lesson with nested answers and paginates', async () => {
      prisma.lessonQuestion.findMany.mockResolvedValue([fakeQuestion]);
      prisma.lessonQuestion.count.mockResolvedValue(1);

      const result = await repository.findByLessonWithAnswers('lesson_1', 2, 10);

      const expectedWhere = { lessonId: 'lesson_1' };
      expect(prisma.lessonQuestion.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        include: {
          student: true,
          answers: { include: { author: true }, orderBy: { createdAt: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip: 10,
        take: 10,
      });
      expect(prisma.lessonQuestion.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
      expect(result).toEqual({ items: [fakeQuestion], total: 1 });
    });
  });

  describe('findQuestionById', () => {
    it('queries a question by id', async () => {
      prisma.lessonQuestion.findUnique.mockResolvedValue(fakeQuestion);

      const result = await repository.findQuestionById('question_1');

      expect(prisma.lessonQuestion.findUnique).toHaveBeenCalledWith({
        where: { id: 'question_1' },
      });
      expect(result).toBe(fakeQuestion);
    });
  });

  describe('createQuestion', () => {
    it('passes data straight through to prisma', async () => {
      prisma.lessonQuestion.create.mockResolvedValue(fakeQuestion);
      const data = { lessonId: 'lesson_1', studentId: 'student_1', content: 'How does this work?' };

      const result = await repository.createQuestion(data);

      expect(prisma.lessonQuestion.create).toHaveBeenCalledWith({ data });
      expect(result).toBe(fakeQuestion);
    });
  });

  describe('createAnswer', () => {
    it('passes data straight through to prisma', async () => {
      prisma.lessonAnswer.create.mockResolvedValue(fakeAnswer);
      const data = { questionId: 'question_1', authorId: 'user_1', content: 'Here is how.' };

      const result = await repository.createAnswer(data);

      expect(prisma.lessonAnswer.create).toHaveBeenCalledWith({ data });
      expect(result).toBe(fakeAnswer);
    });
  });
});
