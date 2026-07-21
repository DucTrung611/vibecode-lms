import { Injectable } from '@nestjs/common';
import { DocumentChunk } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';

@Injectable()
export class DocumentChunkRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByCourseId(courseId: string): Promise<DocumentChunk[]> {
    return this.prisma.documentChunk.findMany({ where: { courseId } });
  }
}
