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

export interface UpdateLessonData {
  title?: string;
  type?: LessonType;
  videoUrl?: string;
  content?: string;
  durationSec?: number;
}

@Injectable()
export class LessonRepository {
  constructor(private readonly prisma: PrismaService) {}

  countByModule(moduleId: string): Promise<number> {
    return this.prisma.lesson.count({ where: { moduleId } });
  }

  findById(id: string): Promise<Lesson | null> {
    return this.prisma.lesson.findUnique({ where: { id } });
  }

  create(data: CreateLessonData): Promise<Lesson> {
    return this.prisma.lesson.create({ data });
  }

  update(id: string, data: UpdateLessonData): Promise<Lesson> {
    return this.prisma.lesson.update({ where: { id }, data });
  }

  findCourseIdById(
    id: string,
  ): Promise<{ module: { courseId: string } } | null> {
    return this.prisma.lesson.findUnique({
      where: { id },
      select: { module: { select: { courseId: true } } },
    });
  }
}
