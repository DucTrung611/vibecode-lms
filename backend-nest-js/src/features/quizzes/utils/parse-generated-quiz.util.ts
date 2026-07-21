import { ApiException } from '../../../shared/types/api-error-code.type';
import { GeneratedQuestion } from './generated-quiz.types';

const ALLOWED_TYPES = new Set(['SINGLE_CHOICE', 'MULTIPLE_CHOICE']);
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 5;

/**
 * LLMs sometimes wrap JSON in a markdown code fence despite instructions
 * not to — strip it defensively before parsing.
 */
function extractJson(raw: string): string {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(raw);
  return (fenced ? fenced[1] : raw).trim();
}

function isValidOption(
  value: unknown,
): value is { content: string; isCorrect: boolean } {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const option = value as Record<string, unknown>;
  return (
    typeof option.content === 'string' &&
    option.content.trim().length > 0 &&
    typeof option.isCorrect === 'boolean'
  );
}

function isValidQuestion(value: unknown): value is GeneratedQuestion {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const question = value as Record<string, unknown>;

  if (typeof question.type !== 'string' || !ALLOWED_TYPES.has(question.type)) {
    return false;
  }
  if (
    typeof question.content !== 'string' ||
    question.content.trim().length === 0
  ) {
    return false;
  }
  if (typeof question.points !== 'number' || question.points <= 0) {
    return false;
  }
  if (
    !Array.isArray(question.options) ||
    question.options.length < MIN_OPTIONS ||
    question.options.length > MAX_OPTIONS
  ) {
    return false;
  }
  if (!question.options.every(isValidOption)) {
    return false;
  }
  return question.options.some(
    (option) => (option as { isCorrect: boolean }).isCorrect,
  );
}

export function parseGeneratedQuiz(raw: string): GeneratedQuestion[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJson(raw));
  } catch {
    throw new ApiException(
      502,
      'QUIZ_004',
      'AI provider returned an invalid quiz format',
    );
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new ApiException(
      502,
      'QUIZ_004',
      'AI provider returned an invalid quiz format',
    );
  }

  const { questions } = parsed as { questions?: unknown };
  if (
    !Array.isArray(questions) ||
    questions.length === 0 ||
    !questions.every(isValidQuestion)
  ) {
    throw new ApiException(
      502,
      'QUIZ_004',
      'AI provider returned an invalid quiz format',
    );
  }

  return questions;
}
