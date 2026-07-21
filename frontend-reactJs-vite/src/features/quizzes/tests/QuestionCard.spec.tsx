import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { QuestionCard } from '../components/QuestionCard';
import type { Question } from '../types/quiz.types';

const singleChoiceQuestion: Question = {
  id: 'q_1',
  type: 'SINGLE_CHOICE',
  content: '2+2?',
  points: 10,
  order: 0,
  options: [
    { id: 'opt_1', content: '3' },
    { id: 'opt_2', content: '4' },
  ],
};

const textQuestion: Question = {
  id: 'q_2',
  type: 'TEXT',
  content: 'Explain recursion.',
  points: 10,
  order: 1,
};

describe('QuestionCard', () => {
  it('renders radio options for a choice question and reports the selection', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <QuestionCard
        question={singleChoiceQuestion}
        index={0}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('radio', { name: '4' }));

    expect(onChange).toHaveBeenCalledWith({
      questionId: 'q_1',
      selectedOptionId: 'opt_2',
    });
  });

  it('marks the previously selected option as checked', () => {
    render(
      <QuestionCard
        question={singleChoiceQuestion}
        index={0}
        answer={{ questionId: 'q_1', selectedOptionId: 'opt_2' }}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('radio', { name: '4' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '3' })).not.toBeChecked();
  });

  it('renders a textarea for a TEXT question and reports the typed answer', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <QuestionCard question={textQuestion} index={1} onChange={onChange} />,
    );

    await user.type(screen.getByRole('textbox'), 'x');

    expect(onChange).toHaveBeenCalledWith({
      questionId: 'q_2',
      answerText: 'x',
    });
  });
});
