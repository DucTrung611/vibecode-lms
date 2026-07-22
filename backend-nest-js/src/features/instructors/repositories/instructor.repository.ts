import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';

@Injectable()
export class InstructorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPublishedCourseIds(instructorId: string): Promise<string[]> {
    const courses = await this.prisma.course.findMany({
      where: { instructorId, status: 'PUBLISHED', deletedAt: null },
      select: { id: true },
    });
    return courses.map((course) => course.id);
  }

  async countDistinctStudents(courseIds: string[]): Promise<number> {
    if (courseIds.length === 0) {
      return 0;
    }
    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
      distinct: ['studentId'],
      select: { studentId: true },
    });
    return enrollments.length;
  }

  async ratingSummary(
    courseIds: string[],
  ): Promise<{ average: number | null; count: number }> {
    if (courseIds.length === 0) {
      return { average: null, count: 0 };
    }
    const result = await this.prisma.review.aggregate({
      where: { courseId: { in: courseIds } },
      _avg: { rating: true },
      _count: true,
    });
    return { average: result._avg.rating, count: result._count };
  }
}
