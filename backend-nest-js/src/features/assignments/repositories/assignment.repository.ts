import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';

const detailInclude = {
  lesson: {
    select: { module: { select: { courseId: true } } },
  },
} satisfies Prisma.AssignmentInclude;

export type AssignmentWithCourse = Prisma.AssignmentGetPayload<{
  include: typeof detailInclude;
}>;

@Injectable()
export class AssignmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByIdWithCourse(id: string): Promise<AssignmentWithCourse | null> {
    return this.prisma.assignment.findUnique({
      where: { id },
      include: detailInclude,
    });
  }
}
