import { Injectable } from '@nestjs/common';
import { LessonAnswer, LessonQuestion } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';

export interface CreateQuestionData {
  lessonId: string;
  studentId: string;
  content: string;
}

export interface CreateAnswerData {
  questionId: string;
  authorId: string;
  content: string;
}

@Injectable()
export class DiscussionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByLessonWithAnswers(lessonId: string, page: number, limit: number) {
    const where = { lessonId };
    const [items, total] = await Promise.all([
      this.prisma.lessonQuestion.findMany({
        where,
        include: {
          student: true,
          answers: { include: { author: true }, orderBy: { createdAt: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.lessonQuestion.count({ where }),
    ]);
    return { items, total };
  }

  findQuestionById(id: string): Promise<LessonQuestion | null> {
    return this.prisma.lessonQuestion.findUnique({ where: { id } });
  }

  createQuestion(data: CreateQuestionData): Promise<LessonQuestion> {
    return this.prisma.lessonQuestion.create({ data });
  }

  createAnswer(data: CreateAnswerData): Promise<LessonAnswer> {
    return this.prisma.lessonAnswer.create({ data });
  }
}
