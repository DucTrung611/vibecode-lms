import { parseGeneratedLearningPath } from '../utils/parse-generated-learning-path.util';

const validCourseIds = new Set(['course_1', 'course_2']);

describe('parseGeneratedLearningPath', () => {
  it('parses a valid JSON payload', () => {
    const result = parseGeneratedLearningPath(
      JSON.stringify({
        title: 'Frontend Foundations',
        description: 'HTML then CSS',
        courseIds: ['course_1', 'course_2'],
      }),
      validCourseIds,
    );

    expect(result).toEqual({
      title: 'Frontend Foundations',
      description: 'HTML then CSS',
      courseIds: ['course_1', 'course_2'],
    });
  });

  it('strips a markdown code fence before parsing', () => {
    const fenced = `\`\`\`json\n${JSON.stringify({ title: 'Path', courseIds: ['course_1'] })}\n\`\`\``;

    const result = parseGeneratedLearningPath(fenced, validCourseIds);

    expect(result.title).toBe('Path');
  });

  it('omits description when not provided', () => {
    const result = parseGeneratedLearningPath(
      JSON.stringify({ title: 'Path', courseIds: ['course_1'] }),
      validCourseIds,
    );

    expect(result.description).toBeUndefined();
  });

  it('throws LEARNING_PATH_003 (502) for invalid JSON', () => {
    expect(() =>
      parseGeneratedLearningPath('not json', validCourseIds),
    ).toThrow(
      expect.objectContaining({
        httpStatus: 502,
        code: 'LEARNING_PATH_003',
      }) as Error,
    );
  });

  it('throws LEARNING_PATH_003 (502) when title is missing', () => {
    expect(() =>
      parseGeneratedLearningPath(
        JSON.stringify({ courseIds: ['course_1'] }),
        validCourseIds,
      ),
    ).toThrow(
      expect.objectContaining({
        httpStatus: 502,
        code: 'LEARNING_PATH_003',
      }) as Error,
    );
  });

  it('throws LEARNING_PATH_003 (502) when courseIds is empty', () => {
    expect(() =>
      parseGeneratedLearningPath(
        JSON.stringify({ title: 'Path', courseIds: [] }),
        validCourseIds,
      ),
    ).toThrow(
      expect.objectContaining({
        httpStatus: 502,
        code: 'LEARNING_PATH_003',
      }) as Error,
    );
  });

  it('throws LEARNING_PATH_003 (502) when a courseId is not in the candidate set (hallucinated id)', () => {
    expect(() =>
      parseGeneratedLearningPath(
        JSON.stringify({ title: 'Path', courseIds: ['course_1', 'made_up'] }),
        validCourseIds,
      ),
    ).toThrow(
      expect.objectContaining({
        httpStatus: 502,
        code: 'LEARNING_PATH_003',
      }) as Error,
    );
  });
});
