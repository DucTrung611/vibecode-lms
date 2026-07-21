import { DocumentChunk } from '@prisma/client';

const MIN_WORD_LENGTH = 3;
const DEFAULT_LIMIT = 3;

/**
 * Naive whole-word overlap scoring — the MVP fallback in place of real
 * vector similarity search (see DocumentChunk's schema comment). Matches
 * whole tokens (not substrings) so e.g. "the" doesn't false-positive on
 * "synthesis". No embeddings, no external calls.
 */
export function retrieveRelevantChunks(
  chunks: DocumentChunk[],
  query: string,
  limit = DEFAULT_LIMIT,
): DocumentChunk[] {
  const queryWords = new Set(
    query
      .toLowerCase()
      .split(/\W+/)
      .filter((word) => word.length >= MIN_WORD_LENGTH),
  );

  if (queryWords.size === 0) {
    return [];
  }

  return chunks
    .map((chunk) => {
      const contentWords = new Set(chunk.content.toLowerCase().split(/\W+/));
      let score = 0;
      for (const word of queryWords) {
        if (contentWords.has(word)) {
          score += 1;
        }
      }
      return { chunk, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.chunk);
}
