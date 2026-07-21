import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ReviewForm } from '../components/ReviewForm';

describe('ReviewForm', () => {
  it('shows a validation error and does not submit without a rating', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ReviewForm isPending={false} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /post review/i }));

    expect(await screen.findByText(/pick a rating/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the picked rating and comment', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ReviewForm isPending={false} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: '5 stars' }));
    await user.type(
      screen.getByLabelText(/comment/i),
      'Really enjoyed this course',
    );
    await user.click(screen.getByRole('button', { name: /post review/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toEqual({
      rating: 5,
      comment: 'Really enjoyed this course',
    });
  });

  it('disables the submit button and shows a pending label while posting', () => {
    render(<ReviewForm isPending={true} onSubmit={vi.fn()} />);

    expect(screen.getByRole('button', { name: /posting/i })).toBeDisabled();
  });
});
