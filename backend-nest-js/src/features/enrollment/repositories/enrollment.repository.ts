import { Injectable } from '@nestjs/common';
import { Enrollment } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';

export interface CreateEnrollmentData {
  studentId: string;
  courseId: string;
}

@Injectable()
export class EnrollmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByStudentAndCourse(
    studentId: string,
    courseId: string,
  ): Promise<Enrollment | null> {
    return this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
  }

  findById(id: string): Promise<Enrollment | null> {
    return this.prisma.enrollment.findUnique({ where: { id } });
  }

  async findByStudent(studentId: string, page: number, limit: number) {
    const where = { studentId };
    const [items, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where,
        include: { course: true },
        orderBy: { enrolledAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.enrollment.count({ where }),
    ]);
    return { items, total };
  }

  create(data: CreateEnrollmentData): Promise<Enrollment> {
    return this.prisma.enrollment.create({ data });
  }

  markCompleted(id: string): Promise<Enrollment> {
    return this.prisma.enrollment.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
  }
}
