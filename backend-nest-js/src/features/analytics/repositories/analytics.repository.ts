import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';

export interface InstructorCourseSummary {
  id: string;
  title: string;
}

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  countEnrollments(courseId: string): Promise<number> {
    return this.prisma.enrollment.count({ where: { courseId } });
  }

  countCompletedEnrollments(courseId: string): Promise<number> {
    return this.prisma.enrollment.count({
      where: { courseId, status: 'COMPLETED' },
    });
  }

  async sumRevenue(courseId: string): Promise<number> {
    const result = await this.prisma.orderItem.aggregate({
      where: { courseId, order: { status: 'PAID' } },
      _sum: { price: true },
    });
    return Number(result._sum.price ?? 0);
  }

  async ratingSummary(courseId: string): Promise<{ average: number | null; count: number }> {
    const result = await this.prisma.review.aggregate({
      where: { courseId },
      _avg: { rating: true },
      _count: true,
    });
    return { average: result._avg.rating, count: result._count };
  }

  async avgQuizScore(courseId: string): Promise<number | null> {
    const result = await this.prisma.quizAttempt.aggregate({
      where: {
        submittedAt: { not: null },
        quiz: { lesson: { module: { courseId } } },
      },
      _avg: { score: true },
    });
    return result._avg.score;
  }

  findInstructorCourses(instructorId: string): Promise<InstructorCourseSummary[]> {
    return this.prisma.course.findMany({
      where: { instructorId, deletedAt: null },
      select: { id: true, title: true },
    });
  }
}
