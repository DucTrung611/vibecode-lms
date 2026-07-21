import { buildQuizGenerationPrompt } from '../utils/quiz-prompt.util';

describe('buildQuizGenerationPrompt', () => {
  it('includes the lesson title, content, and requested question count', () => {
    const prompt = buildQuizGenerationPrompt(
      {
        title: 'Right Triangles',
        content: 'A right triangle has one 90-degree angle.',
      },
      3,
    );

    expect(prompt).toContain('Right Triangles');
    expect(prompt).toContain('A right triangle has one 90-degree angle.');
    expect(prompt).toContain('exactly 3 quiz questions');
    expect(prompt).toContain('JSON');
  });

  it('falls back to the lesson title when content is null', () => {
    const prompt = buildQuizGenerationPrompt(
      { title: 'Right Triangles', content: null },
      5,
    );

    expect(prompt).toContain('Lesson material:\nRight Triangles');
  });
});
