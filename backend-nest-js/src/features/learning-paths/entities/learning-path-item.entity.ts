import { Course, LearningPathItem } from '@prisma/client';

export class LearningPathItemEntity {
  id: string;
  learningPathId: string;
  courseId: string;
  order: number;
  course?: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    price: number;
  };

  static fromPrisma(
    item: LearningPathItem & { course?: Course },
  ): LearningPathItemEntity {
    const entity = new LearningPathItemEntity();
    entity.id = item.id;
    entity.learningPathId = item.learningPathId;
    entity.courseId = item.courseId;
    entity.order = item.order;
    if (item.course) {
      entity.course = {
        id: item.course.id,
        title: item.course.title,
        thumbnailUrl: item.course.thumbnailUrl,
        price: Number(item.course.price),
      };
    }
    return entity;
  }
}
