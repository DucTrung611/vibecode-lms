export interface CandidateCourse {
  id: string;
  title: string;
  description: string;
  level: string;
}

const RESPONSE_SHAPE = `{"title":"...","description":"...","courseIds":["id1","id2"]}`;

export function buildLearningPathPrompt(
  courses: CandidateCourse[],
  topic: string | undefined,
): string {
  const catalog = courses
    .map(
      (course) =>
        `- id: ${course.id} | ${course.title} (${course.level}) | ${course.description}`,
    )
    .join('\n');
  const goal = topic
    ? `The student wants to learn: ${topic}.`
    : 'Recommend a well-rounded introductory path across the available courses.';

  return [
    'Available courses:',
    catalog,
    '',
    goal,
    "Choose 3 to 6 courses from the list above, using their exact 'id' values, and order them into a coherent learning path from foundational to advanced.",
    'Respond with ONLY valid JSON matching this shape, no markdown fences, no prose:',
    RESPONSE_SHAPE,
  ].join('\n');
}
