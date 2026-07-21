import { Module as ModuleModel } from '@prisma/client';
import { LessonEntity, LessonWithLinks } from './lesson.entity';

export class ModuleEntity {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons?: LessonEntity[];

  static fromPrisma(
    module: ModuleModel & { lessons?: LessonWithLinks[] },
  ): ModuleEntity {
    const entity = new ModuleEntity();
    entity.id = module.id;
    entity.courseId = module.courseId;
    entity.title = module.title;
    entity.order = module.order;
    if (module.lessons) {
      entity.lessons = module.lessons
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((lesson) => LessonEntity.fromPrisma(lesson));
    }
    return entity;
  }
}
