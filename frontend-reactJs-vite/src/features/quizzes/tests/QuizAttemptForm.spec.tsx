import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { QuizAttemptForm } from '../components/QuizAttemptForm';
import type { Quiz } from '../types/quiz.types';

const quiz: Quiz = {
  id: 'quiz_1',
  lessonId: 'lesson_1',
  title: 'Algebra Basics',
  isAiGenerated: false,
  passScore: 50,
  timeLimitSec: null,
  questions: [
    {
      id: 'q_1',
      type: 'SINGLE_CHOICE',
      content: '2+2?',
      points: 10,
      order: 0,
      options: [
        { id: 'opt_1', content: '3' },
        { id: 'opt_2', content: '4' },
      ],
    },
  ],
};

describe('QuizAttemptForm', () => {
  it('renders a QuestionCard per question and calls onAnswerChange on selection', async () => {
    const onAnswerChange = vi.fn();
    const user = userEvent.setup();
    render(
      <QuizAttemptForm
        quiz={quiz}
        answers={{}}
        onAnswerChange={onAnswerChange}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />,
    );

    await user.click(screen.getByRole('radio', { name: '4' }));

    expect(onAnswerChange).toHaveBeenCalledWith({
      questionId: 'q_1',
      selectedOptionId: 'opt_2',
    });
  });

  it('calls onSubmit when the form is submitted', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <QuizAttemptForm
        quiz={quiz}
        answers={{}}
        onAnswerChange={vi.fn()}
        onSubmit={onSubmit}
        isSubmitting={false}
      />,
    );

    await user.click(screen.getByRole('button', { name: /submit answers/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('disables the submit button and shows a pending label while submitting', () => {
    render(
      <QuizAttemptForm
        quiz={quiz}
        answers={{}}
        onAnswerChange={vi.fn()}
        onSubmit={vi.fn()}
        isSubmitting={true}
      />,
    );

    expect(
      screen.getByRole('button', { name: /submitting/i }),
    ).toBeDisabled();
  });
});
