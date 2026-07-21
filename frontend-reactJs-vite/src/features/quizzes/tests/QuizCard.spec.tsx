import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { QuizCard } from '../components/QuizCard';
import type { Quiz } from '../types/quiz.types';

const quiz: Quiz = {
  id: 'quiz_1',
  lessonId: 'lesson_1',
  title: 'Algebra Basics',
  isAiGenerated: false,
  passScore: 50,
  timeLimitSec: 600,
  questions: [
    { id: 'q_1', type: 'SINGLE_CHOICE', content: '2+2?', points: 10, order: 0 },
  ],
};

describe('QuizCard', () => {
  it('shows the quiz title, question count, pass score, and time limit', () => {
    render(<QuizCard quiz={quiz} isStarting={false} onStart={vi.fn()} />);

    expect(screen.getByText('Algebra Basics')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('10 min')).toBeInTheDocument();
  });

  it('calls onStart when the button is clicked', async () => {
    const onStart = vi.fn();
    const user = userEvent.setup();
    render(<QuizCard quiz={quiz} isStarting={false} onStart={onStart} />);

    await user.click(screen.getByRole('button', { name: /start quiz/i }));

    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('disables the button and shows a pending label while starting', () => {
    render(<QuizCard quiz={quiz} isStarting={true} onStart={vi.fn()} />);

    expect(screen.getByRole('button', { name: /starting/i })).toBeDisabled();
  });
});
