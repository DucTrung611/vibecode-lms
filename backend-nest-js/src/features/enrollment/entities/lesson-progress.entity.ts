import { LessonProgress } from '@prisma/client';

export class LessonProgressEntity {
  id: string;
  enrollmentId: string;
  lessonId: string;
  status: string;
  watchedSeconds: number;
  completedAt: Date | null;

  static fromPrisma(progress: LessonProgress): LessonProgressEntity {
    const entity = new LessonProgressEntity();
    entity.id = progress.id;
    entity.enrollmentId = progress.enrollmentId;
    entity.lessonId = progress.lessonId;
    entity.status = progress.status;
    entity.watchedSeconds = progress.watchedSeconds;
    entity.completedAt = progress.completedAt;
    return entity;
  }
}
