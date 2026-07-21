const RESPONSE_SHAPE = `{"questions":[{"type":"SINGLE_CHOICE"|"MULTIPLE_CHOICE","content":"...","points":10,"options":[{"content":"...","isCorrect":true},{"content":"...","isCorrect":false}]}]}`;

export function buildQuizGenerationPrompt(
  lesson: { title: string; content: string | null },
  questionCount: number,
): string {
  const material = lesson.content?.trim() || lesson.title;

  return [
    `Lesson title: ${lesson.title}`,
    '',
    'Lesson material:',
    material,
    '',
    `Write exactly ${questionCount} quiz questions testing understanding of this lesson.`,
    'Each question needs 2-5 options. SINGLE_CHOICE has exactly one correct option; MULTIPLE_CHOICE may have more than one.',
    'Respond with ONLY valid JSON matching this shape, no markdown fences, no prose:',
    RESPONSE_SHAPE,
  ].join('\n');
}
