import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';

const LIST_INCLUDE = {
  items: { include: { course: true }, orderBy: { order: 'asc' as const } },
};

export interface CreateGeneratedLearningPathData {
  title: string;
  description?: string;
  createdById: string;
  courseIds: string[];
}

@Injectable()
export class LearningPathRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(page: number, limit: number) {
    const [items, total] = await Promise.all([
      this.prisma.learningPath.findMany({
        include: LIST_INCLUDE,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.learningPath.count(),
    ]);
    return { items, total };
  }

  findById(id: string) {
    return this.prisma.learningPath.findUnique({ where: { id } });
  }

  createGenerated(data: CreateGeneratedLearningPathData) {
    return this.prisma.learningPath.create({
      data: {
        title: data.title,
        description: data.description,
        createdById: data.createdById,
        isAiGenerated: true,
        items: {
          create: data.courseIds.map((courseId, index) => ({
            courseId,
            order: index,
          })),
        },
      },
      include: LIST_INCLUDE,
    });
  }
}
