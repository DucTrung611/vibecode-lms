import { Injectable } from '@nestjs/common';
import { LessonProgress, LessonProgressStatus } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';

export interface UpsertLessonProgressData {
  status?: LessonProgressStatus;
  watchedSeconds?: number;
  completedAt?: Date | null;
}

@Injectable()
export class LessonProgressRepository {
  constructor(private readonly prisma: PrismaService) {}

  upsert(
    enrollmentId: string,
    lessonId: string,
    data: UpsertLessonProgressData,
  ): Promise<LessonProgress> {
    return this.prisma.lessonProgress.upsert({
      where: { enrollmentId_lessonId: { enrollmentId, lessonId } },
      create: {
        enrollmentId,
        lessonId,
        status: data.status ?? 'IN_PROGRESS',
        watchedSeconds: data.watchedSeconds ?? 0,
        completedAt: data.completedAt ?? null,
      },
      update: {
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.watchedSeconds !== undefined
          ? { watchedSeconds: data.watchedSeconds }
          : {}),
        ...(data.completedAt !== undefined
          ? { completedAt: data.completedAt }
          : {}),
      },
    });
  }

  async findCompletedLessonIds(enrollmentId: string): Promise<string[]> {
    const rows = await this.prisma.lessonProgress.findMany({
      where: { enrollmentId, status: 'COMPLETED' },
      select: { lessonId: true },
    });
    return rows.map((row) => row.lessonId);
  }
}
