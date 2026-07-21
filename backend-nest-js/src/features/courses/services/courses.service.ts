import { Injectable, Logger } from '@nestjs/common';
import { ApiException } from '../../../shared/types/api-error-code.type';
import { PaginatedResult } from '../../../shared/types/paginated-result.type';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  normalizePagination,
} from '../../../shared/utils/pagination.util';
import { CreateCourseDto } from '../dto/create-course.dto';
import { CreateLessonDto } from '../dto/create-lesson.dto';
import { CreateModuleDto } from '../dto/create-module.dto';
import { QueryCoursesDto } from '../dto/query-courses.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { CourseEntity } from '../entities/course.entity';
import { LessonEntity } from '../entities/lesson.entity';
import { ModuleEntity } from '../entities/module.entity';
import { CourseRepository } from '../repositories/course.repository';
import { LessonRepository } from '../repositories/lesson.repository';
import { ModuleRepository } from '../repositories/module.repository';
import { slugify, withRandomSuffix } from '../utils/slug.util';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly moduleRepository: ModuleRepository,
    private readonly lessonRepository: LessonRepository,
  ) {}

  async findAll(
    query: QueryCoursesDto,
  ): Promise<PaginatedResult<CourseEntity>> {
    const { page, limit } = normalizePagination({
      page: query.page ?? DEFAULT_PAGE,
      limit: query.limit ?? DEFAULT_LIMIT,
    });

    const { items, total } = await this.courseRepository.findMany({
      page,
      limit,
      sortBy: query.sortBy ?? 'createdAt',
      order: query.order ?? 'desc',
      status: query.status,
      categoryId: query.categoryId,
      level: query.level,
    });

    return {
      items: items.map((course) => CourseEntity.fromPrisma(course)),
      meta: { page, limit, total },
    };
  }

  async findById(id: string): Promise<CourseEntity> {
    const course = await this.courseRepository.findByIdWithDetail(id);
    if (!course) {
      throw new ApiException(404, 'COURSE_004', 'Course not found');
    }
    return CourseEntity.fromPrisma(course);
  }

  async create(
    instructorId: string,
    dto: CreateCourseDto,
  ): Promise<CourseEntity> {
    if (dto.categoryId) {
      await this.assertCategoryExists(dto.categoryId);
    }

    const slug = await this.generateUniqueSlug(dto.title);
    const course = await this.courseRepository.create({
      title: dto.title,
      slug,
      description: dto.description,
      thumbnailUrl: dto.thumbnailUrl,
      price: dto.price,
      level: dto.level,
      categoryId: dto.categoryId,
      instructorId,
    });

    this.logger.log(
      `Course ${course.id} created by instructor ${instructorId}`,
    );
    return CourseEntity.fromPrisma(course);
  }

  async update(
    instructorId: string,
    courseId: string,
    dto: UpdateCourseDto,
  ): Promise<CourseEntity> {
    const course = await this.getOwnedCourseOrThrow(instructorId, courseId);

    if (dto.categoryId) {
      await this.assertCategoryExists(dto.categoryId);
    }

    const updated = await this.courseRepository.update(course.id, dto);
    return CourseEntity.fromPrisma(updated);
  }

  async remove(instructorId: string, courseId: string): Promise<void> {
    const course = await this.getOwnedCourseOrThrow(instructorId, courseId);
    await this.courseRepository.softDelete(course.id);
  }

  async addModule(
    instructorId: string,
    courseId: string,
    dto: CreateModuleDto,
  ): Promise<ModuleEntity> {
    const course = await this.getOwnedCourseOrThrow(instructorId, courseId);

    const order =
      dto.order ?? (await this.moduleRepository.countByCourse(course.id));
    const module = await this.moduleRepository.create({
      courseId: course.id,
      title: dto.title,
      order,
    });

    return ModuleEntity.fromPrisma(module);
  }

  async addLesson(
    instructorId: string,
    moduleId: string,
    dto: CreateLessonDto,
  ): Promise<LessonEntity> {
    const module = await this.moduleRepository.findById(moduleId);
    if (!module) {
      throw new ApiException(404, 'COURSE_006', 'Module not found');
    }
    if (module.course.instructorId !== instructorId) {
      throw new ApiException(403, 'AUTH_003', 'You do not own this course');
    }

    const order =
      dto.order ?? (await this.lessonRepository.countByModule(module.id));
    const lesson = await this.lessonRepository.create({
      moduleId: module.id,
      title: dto.title,
      type: dto.type,
      videoUrl: dto.videoUrl,
      content: dto.content,
      durationSec: dto.durationSec,
      order,
    });

    return LessonEntity.fromPrisma(lesson);
  }

  private async getOwnedCourseOrThrow(instructorId: string, courseId: string) {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new ApiException(404, 'COURSE_004', 'Course not found');
    }
    if (course.instructorId !== instructorId) {
      throw new ApiException(403, 'AUTH_003', 'You do not own this course');
    }
    return course;
  }

  private async assertCategoryExists(categoryId: string): Promise<void> {
    const exists = await this.courseRepository.categoryExists(categoryId);
    if (!exists) {
      throw new ApiException(404, 'COURSE_005', 'Category not found');
    }
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    const base = slugify(title);
    const existing = await this.courseRepository.findBySlug(base);
    if (!existing) {
      return base;
    }

    let candidate = withRandomSuffix(base);
    while (await this.courseRepository.findBySlug(candidate)) {
      candidate = withRandomSuffix(base);
    }
    return candidate;
  }
}
