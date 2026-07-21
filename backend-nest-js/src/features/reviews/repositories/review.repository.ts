import { Injectable } from '@nestjs/common';
import { Review } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';

export interface CreateReviewData {
  courseId: string;
  studentId: string;
  rating: number;
  comment?: string;
}

@Injectable()
export class ReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByStudentAndCourse(
    studentId: string,
    courseId: string,
  ): Promise<Review | null> {
    return this.prisma.review.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
  }

  async findByCourse(courseId: string, page: number, limit: number) {
    const where = { courseId };
    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: { student: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);
    return { items, total };
  }

  create(data: CreateReviewData): Promise<Review> {
    return this.prisma.review.create({ data });
  }
}
