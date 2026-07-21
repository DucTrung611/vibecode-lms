import { Category } from '@prisma/client';

export class CategoryEntity {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;

  static fromPrisma(category: Category): CategoryEntity {
    const entity = new CategoryEntity();
    entity.id = category.id;
    entity.name = category.name;
    entity.slug = category.slug;
    entity.parentId = category.parentId;
    return entity;
  }
}
