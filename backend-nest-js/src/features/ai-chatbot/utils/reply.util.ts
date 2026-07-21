import { DocumentChunk } from '@prisma/client';

const EXCERPT_LENGTH = 280;
const NO_CONTEXT_REPLY =
  "I don't have specific course material to answer that yet. Try asking a question scoped to a course.";

/**
 * Templated stand-in for an LLM call — no provider client exists in this
 * codebase yet (see context.md). Just formats the retrieved chunks.
 */
export function buildAssistantReply(chunks: DocumentChunk[]): string {
  if (chunks.length === 0) {
    return NO_CONTEXT_REPLY;
  }

  const excerpts = chunks.map(
    (chunk) => `- ${chunk.content.slice(0, EXCERPT_LENGTH)}`,
  );
  return `Based on the course material:\n\n${excerpts.join('\n\n')}`;
}
