import { Injectable } from '@nestjs/common';
import { Module as ModuleModel } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';

export interface CreateModuleData {
  courseId: string;
  title: string;
  order: number;
}

@Injectable()
export class ModuleRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.module.findUnique({
      where: { id },
      include: { course: true },
    });
  }

  countByCourse(courseId: string): Promise<number> {
    return this.prisma.module.count({ where: { courseId } });
  }

  create(data: CreateModuleData): Promise<ModuleModel> {
    return this.prisma.module.create({ data });
  }
}
