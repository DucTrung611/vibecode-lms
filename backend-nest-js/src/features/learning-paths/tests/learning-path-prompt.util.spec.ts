import { buildLearningPathPrompt } from '../utils/learning-path-prompt.util';

const courses = [
  {
    id: 'course_1',
    title: 'HTML Basics',
    description: 'Intro to HTML',
    level: 'BEGINNER',
  },
  {
    id: 'course_2',
    title: 'CSS Basics',
    description: 'Intro to CSS',
    level: 'BEGINNER',
  },
];

describe('buildLearningPathPrompt', () => {
  it('lists every candidate course with its id', () => {
    const prompt = buildLearningPathPrompt(courses, undefined);

    expect(prompt).toContain('course_1');
    expect(prompt).toContain('HTML Basics');
    expect(prompt).toContain('course_2');
    expect(prompt).toContain('CSS Basics');
  });

  it('includes the topic when provided', () => {
    const prompt = buildLearningPathPrompt(courses, 'frontend development');

    expect(prompt).toContain('frontend development');
  });

  it('falls back to a generic goal when no topic is given', () => {
    const prompt = buildLearningPathPrompt(courses, undefined);

    expect(prompt).toContain('well-rounded introductory path');
  });
});
