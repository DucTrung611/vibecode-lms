import { ApiException } from '../../../shared/types/api-error-code.type';

export interface GeneratedLearningPath {
  title: string;
  description?: string;
  courseIds: string[];
}

/**
 * LLMs sometimes wrap JSON in a markdown code fence despite instructions
 * not to — strip it defensively before parsing.
 */
function extractJson(raw: string): string {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(raw);
  return (fenced ? fenced[1] : raw).trim();
}

function invalidFormat(): never {
  throw new ApiException(
    502,
    'LEARNING_PATH_003',
    'AI provider returned an invalid learning path format',
  );
}

export function parseGeneratedLearningPath(
  raw: string,
  validCourseIds: Set<string>,
): GeneratedLearningPath {
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJson(raw));
  } catch {
    invalidFormat();
  }

  if (typeof parsed !== 'object' || parsed === null) {
    invalidFormat();
  }

  const { title, description, courseIds } = parsed as Record<string, unknown>;

  if (typeof title !== 'string' || title.trim().length === 0) {
    invalidFormat();
  }
  if (
    !Array.isArray(courseIds) ||
    courseIds.length === 0 ||
    !courseIds.every((id) => typeof id === 'string' && validCourseIds.has(id))
  ) {
    invalidFormat();
  }

  return {
    title: title.trim(),
    description:
      typeof description === 'string' && description.trim().length > 0
        ? description.trim()
        : undefined,
    courseIds: courseIds as string[],
  };
}
