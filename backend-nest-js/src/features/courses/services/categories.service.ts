import { Injectable, Logger } from '@nestjs/common';
import { ApiException } from '../../../shared/types/api-error-code.type';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { CategoryEntity } from '../entities/category.entity';
import { CategoryRepository } from '../repositories/category.repository';
import { slugify, withRandomSuffix } from '../utils/slug.util';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly categoryRepository: CategoryRepository) {}

  async findAll(): Promise<CategoryEntity[]> {
    const categories = await this.categoryRepository.findMany();
    return categories.map((category) => CategoryEntity.fromPrisma(category));
  }

  async create(dto: CreateCategoryDto): Promise<CategoryEntity> {
    if (dto.parentId) {
      const parent = await this.categoryRepository.findById(dto.parentId);
      if (!parent) {
        throw new ApiException(404, 'COURSE_005', 'Category not found');
      }
    }

    const slug = await this.generateUniqueSlug(dto.name);
    const category = await this.categoryRepository.create({
      name: dto.name,
      slug,
      parentId: dto.parentId,
    });

    this.logger.log(`Category ${category.id} created`);
    return CategoryEntity.fromPrisma(category);
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = slugify(name);
    const existing = await this.categoryRepository.findBySlug(base);
    if (!existing) {
      return base;
    }

    let candidate = withRandomSuffix(base);
    while (await this.categoryRepository.findBySlug(candidate)) {
      candidate = withRandomSuffix(base);
    }
    return candidate;
  }
}
