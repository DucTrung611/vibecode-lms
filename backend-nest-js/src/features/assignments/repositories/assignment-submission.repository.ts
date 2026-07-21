import { Injectable } from '@nestjs/common';
import { AssignmentSubmission } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';

export interface CreateSubmissionData {
  assignmentId: string;
  studentId: string;
  fileUrl?: string;
  content?: string;
}

export interface GradeSubmissionData {
  score: number;
  feedback?: string;
  gradedById: string;
}

@Injectable()
export class AssignmentSubmissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<AssignmentSubmission | null> {
    return this.prisma.assignmentSubmission.findUnique({ where: { id } });
  }

  findByAssignmentAndStudent(
    assignmentId: string,
    studentId: string,
  ): Promise<AssignmentSubmission | null> {
    return this.prisma.assignmentSubmission.findUnique({
      where: { assignmentId_studentId: { assignmentId, studentId } },
    });
  }

  create(data: CreateSubmissionData): Promise<AssignmentSubmission> {
    return this.prisma.assignmentSubmission.create({ data });
  }

  grade(id: string, data: GradeSubmissionData): Promise<AssignmentSubmission> {
    return this.prisma.assignmentSubmission.update({
      where: { id },
      data: {
        score: data.score,
        feedback: data.feedback,
        gradedById: data.gradedById,
        gradedAt: new Date(),
      },
    });
  }
}
