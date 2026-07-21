import { parseGeneratedQuiz } from '../utils/parse-generated-quiz.util';

const validPayload = {
  questions: [
    {
      type: 'SINGLE_CHOICE',
      content: 'What is 2+2?',
      points: 10,
      options: [
        { content: '3', isCorrect: false },
        { content: '4', isCorrect: true },
      ],
    },
  ],
};

describe('parseGeneratedQuiz', () => {
  it('parses a valid JSON payload into questions', () => {
    const result = parseGeneratedQuiz(JSON.stringify(validPayload));

    expect(result).toEqual(validPayload.questions);
  });

  it('strips a markdown code fence before parsing', () => {
    const fenced = `Here you go:\n\`\`\`json\n${JSON.stringify(validPayload)}\n\`\`\``;

    const result = parseGeneratedQuiz(fenced);

    expect(result).toEqual(validPayload.questions);
  });

  it('throws QUIZ_004 (502) for invalid JSON', () => {
    expect(() => parseGeneratedQuiz('not json')).toThrow(
      expect.objectContaining({ httpStatus: 502, code: 'QUIZ_004' }) as Error,
    );
  });

  it('throws QUIZ_004 (502) when questions is missing', () => {
    expect(() => parseGeneratedQuiz(JSON.stringify({}))).toThrow(
      expect.objectContaining({ httpStatus: 502, code: 'QUIZ_004' }) as Error,
    );
  });

  it('throws QUIZ_004 (502) when a question has no correct option', () => {
    const invalid = {
      questions: [
        {
          type: 'SINGLE_CHOICE',
          content: 'What is 2+2?',
          points: 10,
          options: [
            { content: '3', isCorrect: false },
            { content: '4', isCorrect: false },
          ],
        },
      ],
    };

    expect(() => parseGeneratedQuiz(JSON.stringify(invalid))).toThrow(
      expect.objectContaining({ httpStatus: 502, code: 'QUIZ_004' }) as Error,
    );
  });

  it('throws QUIZ_004 (502) when a question has fewer than 2 options', () => {
    const invalid = {
      questions: [
        {
          type: 'SINGLE_CHOICE',
          content: 'What is 2+2?',
          points: 10,
          options: [{ content: '4', isCorrect: true }],
        },
      ],
    };

    expect(() => parseGeneratedQuiz(JSON.stringify(invalid))).toThrow(
      expect.objectContaining({ httpStatus: 502, code: 'QUIZ_004' }) as Error,
    );
  });

  it('throws QUIZ_004 (502) for an unknown question type', () => {
    const invalid = {
      questions: [
        {
          type: 'TEXT',
          content: 'What is 2+2?',
          points: 10,
          options: [
            { content: '3', isCorrect: false },
            { content: '4', isCorrect: true },
          ],
        },
      ],
    };

    expect(() => parseGeneratedQuiz(JSON.stringify(invalid))).toThrow(
      expect.objectContaining({ httpStatus: 502, code: 'QUIZ_004' }) as Error,
    );
  });
});
