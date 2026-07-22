import { LessonAnswer, LessonQuestion, User } from '@prisma/client';
import { LessonAnswerEntity } from './lesson-answer.entity';

export interface QuestionStudentSummary {
  id: string;
  fullName: string;
}

type LessonQuestionWithRelations = LessonQuestion & {
  student?: User;
  answers?: (LessonAnswer & { author?: User })[];
};

export class LessonQuestionEntity {
  id: string;
  lessonId: string;
  studentId: string;
  content: string;
  createdAt: Date;
  student?: QuestionStudentSummary;
  answers?: LessonAnswerEntity[];

  static fromPrisma(question: LessonQuestionWithRelations): LessonQuestionEntity {
    const entity = new LessonQuestionEntity();
    entity.id = question.id;
    entity.lessonId = question.lessonId;
    entity.studentId = question.studentId;
    entity.content = question.content;
    entity.createdAt = question.createdAt;
    if (question.student) {
      entity.student = { id: question.student.id, fullName: question.student.fullName };
    }
    if (question.answers) {
      entity.answers = question.answers.map((answer) => LessonAnswerEntity.fromPrisma(answer));
    }
    return entity;
  }
}
