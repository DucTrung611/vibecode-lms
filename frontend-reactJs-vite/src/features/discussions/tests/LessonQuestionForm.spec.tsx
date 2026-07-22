import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LessonQuestionForm } from '../components/LessonQuestionForm';

describe('LessonQuestionForm', () => {
  it('shows a validation error and does not submit without content', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<LessonQuestionForm isPending={false} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /ask question/i }));

    expect(await screen.findByText(/write your question/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the typed question', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<LessonQuestionForm isPending={false} onSubmit={onSubmit} />);

    await user.type(
      screen.getByPlaceholderText(/ask a question/i),
      'How does this work?',
    );
    await user.click(screen.getByRole('button', { name: /ask question/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toEqual({ content: 'How does this work?' });
  });

  it('disables the submit button and shows a pending label while posting', () => {
    render(<LessonQuestionForm isPending={true} onSubmit={vi.fn()} />);

    expect(screen.getByRole('button', { name: /posting/i })).toBeDisabled();
  });
});
