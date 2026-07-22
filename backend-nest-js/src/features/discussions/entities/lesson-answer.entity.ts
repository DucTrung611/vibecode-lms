import { LessonAnswer, User } from '@prisma/client';

export interface AnswerAuthorSummary {
  id: string;
  fullName: string;
  role: string;
}

export class LessonAnswerEntity {
  id: string;
  questionId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  author?: AnswerAuthorSummary;

  static fromPrisma(answer: LessonAnswer & { author?: User }): LessonAnswerEntity {
    const entity = new LessonAnswerEntity();
    entity.id = answer.id;
    entity.questionId = answer.questionId;
    entity.authorId = answer.authorId;
    entity.content = answer.content;
    entity.createdAt = answer.createdAt;
    if (answer.author) {
      entity.author = {
        id: answer.author.id,
        fullName: answer.author.fullName,
        role: answer.author.role,
      };
    }
    return entity;
  }
}
