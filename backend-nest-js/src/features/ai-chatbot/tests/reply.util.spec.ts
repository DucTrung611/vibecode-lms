import { DocumentChunk } from '@prisma/client';
import { buildAssistantReply } from '../utils/reply.util';

function chunk(content: string): DocumentChunk {
  return {
    id: 'chunk_1',
    courseId: 'course_1',
    lessonId: null,
    content,
    embedding: null,
    metadata: null,
    chunkIndex: 0,
  };
}

describe('buildAssistantReply', () => {
  it('returns a fallback message when there are no relevant chunks', () => {
    const reply = buildAssistantReply([]);

    expect(reply).toMatch(/don't have specific course material/i);
  });

  it('formats the chunk excerpts when relevant chunks are found', () => {
    const reply = buildAssistantReply([
      chunk('The Pythagorean theorem relates the sides of a right triangle.'),
    ]);

    expect(reply).toContain('Based on the course material:');
    expect(reply).toContain(
      'The Pythagorean theorem relates the sides of a right triangle.',
    );
  });

  it('truncates long chunk content to a fixed excerpt length', () => {
    const longContent = 'x'.repeat(500);
    const reply = buildAssistantReply([chunk(longContent)]);

    expect(reply).toContain('x'.repeat(280));
    expect(reply).not.toContain('x'.repeat(281));
  });
});
