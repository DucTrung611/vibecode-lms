import { DocumentChunk } from '@prisma/client';
import { retrieveRelevantChunks } from '../utils/retrieval.util';

function chunk(id: string, content: string): DocumentChunk {
  return {
    id,
    courseId: 'course_1',
    lessonId: null,
    content,
    embedding: null,
    metadata: null,
    chunkIndex: 0,
  };
}

describe('retrieveRelevantChunks', () => {
  it('returns chunks whose content overlaps the query, most relevant first', () => {
    const chunks = [
      chunk(
        'chunk_1',
        'The Pythagorean theorem relates the sides of a right triangle.',
      ),
      chunk(
        'chunk_2',
        'Photosynthesis converts sunlight into chemical energy.',
      ),
      chunk(
        'chunk_3',
        'Right triangles and the Pythagorean theorem are used in trigonometry.',
      ),
    ];

    const result = retrieveRelevantChunks(
      chunks,
      'Explain the Pythagorean theorem for right triangles',
    );

    expect(result.map((c) => c.id)).toEqual(['chunk_3', 'chunk_1']);
  });

  it('returns an empty array when no chunk matches', () => {
    const chunks = [
      chunk(
        'chunk_1',
        'Photosynthesis converts sunlight into chemical energy.',
      ),
    ];

    const result = retrieveRelevantChunks(chunks, 'quantum entanglement');

    expect(result).toEqual([]);
  });

  it('returns an empty array when the query has no significant words', () => {
    const chunks = [chunk('chunk_1', 'Some content here.')];

    const result = retrieveRelevantChunks(chunks, 'a an is');

    expect(result).toEqual([]);
  });

  it('caps results at the given limit', () => {
    const chunks = [
      chunk('chunk_1', 'algebra algebra algebra'),
      chunk('chunk_2', 'algebra basics'),
      chunk('chunk_3', 'algebra intro'),
      chunk('chunk_4', 'algebra advanced'),
    ];

    const result = retrieveRelevantChunks(chunks, 'algebra', 2);

    expect(result).toHaveLength(2);
  });
});
