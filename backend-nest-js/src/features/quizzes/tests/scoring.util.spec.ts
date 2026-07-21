import { Question, QuestionOption } from '@prisma/client';
import { gradeAttempt } from '../utils/scoring.util';

type QuestionWithOptions = Question & { options: QuestionOption[] };

const singleChoiceQuestion = (
  overrides: Partial<QuestionWithOptions> = {},
): QuestionWithOptions => ({
  id: 'q_1',
  quizId: 'quiz_1',
  type: 'SINGLE_CHOICE',
  content: 'What is 2+2?',
  points: 10,
  order: 0,
  options: [
    { id: 'opt_1', questionId: 'q_1', content: '3', isCorrect: false },
    { id: 'opt_2', questionId: 'q_1', content: '4', isCorrect: true },
  ],
  ...overrides,
});

const textQuestion = (
  overrides: Partial<QuestionWithOptions> = {},
): QuestionWithOptions => ({
  id: 'q_2',
  quizId: 'quiz_1',
  type: 'TEXT',
  content: 'Explain recursion.',
  points: 10,
  order: 1,
  options: [],
  ...overrides,
});

describe('gradeAttempt', () => {
  it('awards full points for a correct single-choice answer', () => {
    const result = gradeAttempt(
      [singleChoiceQuestion()],
      [{ questionId: 'q_1', selectedOptionId: 'opt_2' }],
      50,
    );

    expect(result.answers).toEqual([
      { questionId: 'q_1', isCorrect: true, pointsEarned: 10 },
    ]);
    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
  });

  it('awards zero points for an incorrect single-choice answer', () => {
    const result = gradeAttempt(
      [singleChoiceQuestion()],
      [{ questionId: 'q_1', selectedOptionId: 'opt_1' }],
      50,
    );

    expect(result.answers).toEqual([
      { questionId: 'q_1', isCorrect: false, pointsEarned: 0 },
    ]);
    expect(result.score).toBe(0);
    expect(result.passed).toBe(false);
  });

  it('always scores TEXT questions as incorrect (no auto-grading)', () => {
    const result = gradeAttempt(
      [textQuestion()],
      [{ questionId: 'q_2', answerText: 'Because it calls itself.' }],
      0,
    );

    expect(result.answers).toEqual([
      { questionId: 'q_2', isCorrect: false, pointsEarned: 0 },
    ]);
    expect(result.score).toBe(0);
  });

  it('scores an unrecognized questionId as incorrect without throwing', () => {
    const result = gradeAttempt(
      [singleChoiceQuestion()],
      [{ questionId: 'not-in-quiz', selectedOptionId: 'opt_2' }],
      0,
    );

    expect(result.answers).toEqual([
      { questionId: 'not-in-quiz', isCorrect: false, pointsEarned: 0 },
    ]);
  });

  it('divides earned points by the total points across all quiz questions, not just answered ones', () => {
    const result = gradeAttempt(
      [singleChoiceQuestion(), textQuestion()],
      [{ questionId: 'q_1', selectedOptionId: 'opt_2' }],
      50,
    );

    // 10 earned out of 20 total (q_2 left unanswered) = 50%
    expect(result.score).toBe(50);
    expect(result.passed).toBe(true);
  });

  it('treats passing as score >= passScore (inclusive boundary)', () => {
    const result = gradeAttempt(
      [singleChoiceQuestion({ points: 100 })],
      [{ questionId: 'q_1', selectedOptionId: 'opt_2' }],
      100,
    );

    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
  });

  it('returns score 0 when the quiz has no questions', () => {
    const result = gradeAttempt([], [], 50);

    expect(result.score).toBe(0);
    expect(result.passed).toBe(false);
  });
});
