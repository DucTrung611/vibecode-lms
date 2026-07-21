import { Lesson } from '@prisma/client';

export class LessonEntity {
  id: string;
  moduleId: string;
  title: string;
  type: string;
  videoUrl: string | null;
  content: string | null;
  durationSec: number | null;
  order: number;

  static fromPrisma(lesson: Lesson): LessonEntity {
    const entity = new LessonEntity();
    entity.id = lesson.id;
    entity.moduleId = lesson.moduleId;
    entity.title = lesson.title;
    entity.type = lesson.type;
    entity.videoUrl = lesson.videoUrl;
    entity.content = lesson.content;
    entity.durationSec = lesson.durationSec;
    entity.order = lesson.order;
    return entity;
  }
}
