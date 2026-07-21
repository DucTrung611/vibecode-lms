import { Injectable } from '@nestjs/common';
import { LearningPathEnrollment } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';

export interface CreateLearningPathEnrollmentData {
  studentId: string;
  learningPathId: string;
}

@Injectable()
export class LearningPathEnrollmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByStudentAndPath(
    studentId: string,
    learningPathId: string,
  ): Promise<LearningPathEnrollment | null> {
    return this.prisma.learningPathEnrollment.findUnique({
      where: { studentId_learningPathId: { studentId, learningPathId } },
    });
  }

  create(
    data: CreateLearningPathEnrollmentData,
  ): Promise<LearningPathEnrollment> {
    return this.prisma.learningPathEnrollment.create({ data });
  }
}
