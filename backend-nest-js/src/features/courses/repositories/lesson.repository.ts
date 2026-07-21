import { Injectable } from '@nestjs/common';
import { Lesson, LessonType } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';

export interface CreateLessonData {
  moduleId: string;
  title: string;
  type: LessonType;
  videoUrl?: string;
  content?: string;
  durationSec?: number;
  order: number;
}

@Injectable()
export class LessonRepository {
  constructor(private readonly prisma: PrismaService) {}

  countByModule(moduleId: string): Promise<number> {
    return this.prisma.lesson.count({ where: { moduleId } });
  }

  create(data: CreateLessonData): Promise<Lesson> {
    return this.prisma.lesson.create({ data });
  }
}
