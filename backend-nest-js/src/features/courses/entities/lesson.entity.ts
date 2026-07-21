import { Assignment, Lesson, Quiz } from '@prisma/client';

export type LessonWithLinks = Lesson & {
  quizzes?: Pick<Quiz, 'id'>[];
  assignments?: Pick<Assignment, 'id'>[];
};

export class LessonEntity {
  id: string;
  moduleId: string;
  title: string;
  type: string;
  videoUrl: string | null;
  content: string | null;
  durationSec: number | null;
  order: number;
  quizId: string | null;
  assignmentId: string | null;

  static fromPrisma(lesson: LessonWithLinks): LessonEntity {
    const entity = new LessonEntity();
    entity.id = lesson.id;
    entity.moduleId = lesson.moduleId;
    entity.title = lesson.title;
    entity.type = lesson.type;
    entity.videoUrl = lesson.videoUrl;
    entity.content = lesson.content;
    entity.durationSec = lesson.durationSec;
    entity.order = lesson.order;
    entity.quizId = lesson.quizzes?.[0]?.id ?? null;
    entity.assignmentId = lesson.assignments?.[0]?.id ?? null;
    return entity;
  }
}
