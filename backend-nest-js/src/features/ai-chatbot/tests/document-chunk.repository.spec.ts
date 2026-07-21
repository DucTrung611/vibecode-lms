import { DocumentChunk } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { DocumentChunkRepository } from '../repositories/document-chunk.repository';

describe('DocumentChunkRepository', () => {
  let repository: DocumentChunkRepository;
  let prisma: {
    documentChunk: {
      findMany: jest.Mock;
    };
  };

  const fakeChunk = { id: 'chunk_1' } as DocumentChunk;

  beforeEach(() => {
    prisma = {
      documentChunk: {
        findMany: jest.fn(),
      },
    };
    repository = new DocumentChunkRepository(
      prisma as unknown as PrismaService,
    );
  });

  describe('findByCourseId', () => {
    it('queries all chunks for the course', async () => {
      prisma.documentChunk.findMany.mockResolvedValue([fakeChunk]);

      const result = await repository.findByCourseId('course_1');

      expect(prisma.documentChunk.findMany).toHaveBeenCalledWith({
        where: { courseId: 'course_1' },
      });
      expect(result).toEqual([fakeChunk]);
    });
  });
});
