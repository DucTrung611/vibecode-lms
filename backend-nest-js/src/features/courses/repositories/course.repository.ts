import { Injectable } from '@nestjs/common';
import { Course, CourseLevel, CourseStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { CourseListFilters } from '../types/courses.types';

export interface CreateCourseData {
  title: string;
  slug: string;
  description: string;
  thumbnailUrl?: string;
  price: number;
  level: CourseLevel;
  categoryId?: string;
  instructorId: string;
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  price?: number;
  level?: CourseLevel;
  status?: CourseStatus;
  categoryId?: string;
}

const detailInclude = {
  instructor: { select: { id: true, fullName: true, avatarUrl: true } },
  modules: {
    include: {
      lessons: {
        include: {
          quizzes: { select: { id: true } },
          assignments: { select: { id: true } },
        },
      },
    },
  },
} satisfies Prisma.CourseInclude;

@Injectable()
export class CourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(
    filters: CourseListFilters,
  ): Promise<{ items: Course[]; total: number }> {
    const where: Prisma.CourseWhereInput = {
      deletedAt: null,
      ...(filters.status ? { status: filters.status as CourseStatus } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.level ? { level: filters.level as CourseLevel } : {}),
      ...(filters.search
        ? {
            OR: [
              { title: { contains: filters.search } },
              { description: { contains: filters.search } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        orderBy: { [filters.sortBy]: filters.order },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.course.count({ where }),
    ]);

    return { items, total };
  }

  findById(id: string): Promise<Course | null> {
    return this.prisma.course.findFirst({ where: { id, deletedAt: null } });
  }

  findByIdWithDetail(id: string) {
    return this.prisma.course.findFirst({
      where: { id, deletedAt: null },
      include: detailInclude,
    });
  }

  findBySlug(slug: string): Promise<Course | null> {
    return this.prisma.course.findUnique({ where: { slug } });
  }

  async findPublishedByInstructor(
    instructorId: string,
    page: number,
    limit: number,
  ): Promise<{ items: Course[]; total: number }> {
    const where: Prisma.CourseWhereInput = {
      instructorId,
      status: 'PUBLISHED',
      deletedAt: null,
    };

    const [items, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.course.count({ where }),
    ]);

    return { items, total };
  }

  categoryExists(categoryId: string): Promise<boolean> {
    return this.prisma.category
      .findUnique({ where: { id: categoryId } })
      .then((category) => category !== null);
  }

  create(data: CreateCourseData): Promise<Course> {
    return this.prisma.course.create({ data });
  }

  update(id: string, data: UpdateCourseData): Promise<Course> {
    return this.prisma.course.update({ where: { id }, data });
  }

  softDelete(id: string): Promise<Course> {
    return this.prisma.course.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
