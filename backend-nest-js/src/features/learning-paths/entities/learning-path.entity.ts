import { Course, LearningPath, LearningPathItem } from '@prisma/client';
import { LearningPathItemEntity } from './learning-path-item.entity';

export class LearningPathEntity {
  id: string;
  title: string;
  description: string | null;
  createdById: string | null;
  isAiGenerated: boolean;
  items?: LearningPathItemEntity[];

  static fromPrisma(
    path: LearningPath & {
      items?: (LearningPathItem & { course?: Course })[];
    },
  ): LearningPathEntity {
    const entity = new LearningPathEntity();
    entity.id = path.id;
    entity.title = path.title;
    entity.description = path.description;
    entity.createdById = path.createdById;
    entity.isAiGenerated = path.isAiGenerated;
    if (path.items) {
      entity.items = path.items.map((item) =>
        LearningPathItemEntity.fromPrisma(item),
      );
    }
    return entity;
  }
}
