import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { GeneratedQuestion } from '../utils/generated-quiz.types';

const detailInclude = {
  questions: {
    include: { options: true },
    orderBy: { order: 'asc' },
  },
  lesson: {
    select: { module: { select: { courseId: true } } },
  },
} satisfies Prisma.QuizInclude;

const generatedInclude = {
  questions: { include: { options: true } },
} satisfies Prisma.QuizInclude;

export type QuizWithQuestions = Prisma.QuizGetPayload<{
  include: typeof detailInclude;
}>;

export interface CreateGeneratedQuizData {
  lessonId: string;
  title: string;
  passScore: number;
  questions: GeneratedQuestion[];
}

@Injectable()
export class QuizRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByIdWithQuestions(id: string): Promise<QuizWithQuestions | null> {
    return this.prisma.quiz.findUnique({
      where: { id },
      include: detailInclude,
    });
  }

  createGenerated(data: CreateGeneratedQuizData) {
    return this.prisma.quiz.create({
      data: {
        lessonId: data.lessonId,
        title: data.title,
        isAiGenerated: true,
        passScore: data.passScore,
        questions: {
          create: data.questions.map((question, index) => ({
            type: question.type,
            content: question.content,
            points: question.points,
            order: index,
            options: {
              create: question.options.map((option) => ({
                content: option.content,
                isCorrect: option.isCorrect,
              })),
            },
          })),
        },
      },
      include: generatedInclude,
    });
  }
}
