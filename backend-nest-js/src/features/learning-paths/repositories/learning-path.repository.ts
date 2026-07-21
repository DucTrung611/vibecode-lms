import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';

const LIST_INCLUDE = {
  items: { include: { course: true }, orderBy: { order: 'asc' as const } },
};

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
}
