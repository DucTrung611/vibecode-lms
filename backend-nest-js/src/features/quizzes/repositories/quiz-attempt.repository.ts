import { Injectable } from '@nestjs/common';
import { QuizAttempt } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { GradedAnswer } from '../types/quiz.types';

export interface CreateAttemptData {
  quizId: string;
  studentId: string;
}

export interface SubmitAttemptData {
  score: number;
  answers: (GradedAnswer & {
    selectedOptionId?: string;
    answerText?: string;
  })[];
}

@Injectable()
export class QuizAttemptRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<QuizAttempt | null> {
    return this.prisma.quizAttempt.findUnique({ where: { id } });
  }

  create(data: CreateAttemptData): Promise<QuizAttempt> {
    return this.prisma.quizAttempt.create({ data });
  }

  async submit(id: string, data: SubmitAttemptData): Promise<QuizAttempt> {
    const [, attempt] = await this.prisma.$transaction([
      this.prisma.quizAnswer.createMany({
        data: data.answers.map((answer) => ({
          attemptId: id,
          questionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId,
          answerText: answer.answerText,
          isCorrect: answer.isCorrect,
        })),
      }),
      this.prisma.quizAttempt.update({
        where: { id },
        data: { score: data.score, submittedAt: new Date() },
      }),
    ]);
    return attempt;
  }
}
