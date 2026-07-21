import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';

const detailInclude = {
  questions: {
    include: { options: true },
    orderBy: { order: 'asc' },
  },
  lesson: {
    select: { module: { select: { courseId: true } } },
  },
} satisfies Prisma.QuizInclude;

export type QuizWithQuestions = Prisma.QuizGetPayload<{
  include: typeof detailInclude;
}>;

@Injectable()
export class QuizRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByIdWithQuestions(id: string): Promise<QuizWithQuestions | null> {
    return this.prisma.quiz.findUnique({
      where: { id },
      include: detailInclude,
    });
  }
}
