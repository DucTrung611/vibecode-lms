import { Course, Module as ModuleModel, Lesson } from '@prisma/client';
import { ModuleEntity } from './module.entity';

export class CourseEntity {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string | null;
  price: number;
  level: string;
  status: string;
  instructorId: string;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  modules?: ModuleEntity[];

  static fromPrisma(
    course: Course & { modules?: (ModuleModel & { lessons: Lesson[] })[] },
  ): CourseEntity {
    const entity = new CourseEntity();
    entity.id = course.id;
    entity.title = course.title;
    entity.slug = course.slug;
    entity.description = course.description;
    entity.thumbnailUrl = course.thumbnailUrl;
    entity.price = Number(course.price);
    entity.level = course.level;
    entity.status = course.status;
    entity.instructorId = course.instructorId;
    entity.categoryId = course.categoryId;
    entity.createdAt = course.createdAt;
    entity.updatedAt = course.updatedAt;
    if (course.modules) {
      entity.modules = course.modules
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((courseModule) => ModuleEntity.fromPrisma(courseModule));
    }
    return entity;
  }
}
