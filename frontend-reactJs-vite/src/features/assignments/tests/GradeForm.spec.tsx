import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { GradeForm } from '../components/GradeForm';

describe('GradeForm', () => {
  it('submits the score and feedback', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<GradeForm isPending={false} onSubmit={onSubmit} />);

    await user.clear(screen.getByLabelText(/score/i));
    await user.type(screen.getByLabelText(/score/i), '90');
    await user.type(screen.getByLabelText(/feedback/i), 'Nice work');
    await user.click(screen.getByRole('button', { name: /save grade/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toEqual({
      score: 90,
      feedback: 'Nice work',
    });
  });

  it('rejects a negative score', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<GradeForm isPending={false} onSubmit={onSubmit} />);

    await user.clear(screen.getByLabelText(/score/i));
    await user.type(screen.getByLabelText(/score/i), '-5');
    await user.click(screen.getByRole('button', { name: /save grade/i }));

    expect(
      await screen.findByText(/score cannot be negative/i),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('disables the submit button and shows a pending label while saving', () => {
    render(<GradeForm isPending={true} onSubmit={vi.fn()} />);

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
  });
});
