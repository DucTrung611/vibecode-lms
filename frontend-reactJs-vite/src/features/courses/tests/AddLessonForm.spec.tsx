import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AddLessonForm } from '../components/AddLessonForm';

describe('AddLessonForm', () => {
  it('shows a validation error and does not submit for an empty title', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<AddLessonForm isPending={false} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /add lesson/i }));

    expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the title with the default VIDEO type', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<AddLessonForm isPending={false} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/new lesson title/i), 'Lesson 1');
    await user.click(screen.getByRole('button', { name: /add lesson/i }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Lesson 1',
        type: 'VIDEO',
      }),
    );
  });

  it('submits the selected lesson type', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<AddLessonForm isPending={false} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/new lesson title/i), 'Quiz 1');
    await user.selectOptions(screen.getByLabelText(/lesson type/i), 'QUIZ');
    await user.click(screen.getByRole('button', { name: /add lesson/i }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Quiz 1',
        type: 'QUIZ',
      }),
    );
  });

  it('disables the submit button while pending', () => {
    render(<AddLessonForm isPending={true} onSubmit={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: /add lesson/i }),
    ).toBeDisabled();
  });
});
