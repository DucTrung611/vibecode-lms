import { LearningPathEnrollment } from '@prisma/client';

export class LearningPathEnrollmentEntity {
  id: string;
  studentId: string;
  learningPathId: string;
  progressPercent: number;
  startedAt: Date;
  completedAt: Date | null;

  static fromPrisma(
    enrollment: LearningPathEnrollment,
  ): LearningPathEnrollmentEntity {
    const entity = new LearningPathEnrollmentEntity();
    entity.id = enrollment.id;
    entity.studentId = enrollment.studentId;
    entity.learningPathId = enrollment.learningPathId;
    entity.progressPercent = enrollment.progressPercent;
    entity.startedAt = enrollment.startedAt;
    entity.completedAt = enrollment.completedAt;
    return entity;
  }
}
