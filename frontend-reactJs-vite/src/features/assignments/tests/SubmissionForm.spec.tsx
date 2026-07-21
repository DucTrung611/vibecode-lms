import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SubmissionForm } from '../components/SubmissionForm';

describe('SubmissionForm', () => {
  it('shows a validation error and does not submit when both fields are empty', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<SubmissionForm isPending={false} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /submit assignment/i }));

    expect(
      await screen.findByText(/provide a file url or written content/i),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits with just written content', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<SubmissionForm isPending={false} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/written answer/i), 'my essay');
    await user.click(screen.getByRole('button', { name: /submit assignment/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toEqual({
      fileUrl: '',
      content: 'my essay',
    });
  });

  it('rejects an invalid file URL', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<SubmissionForm isPending={false} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/file url/i), 'not-a-url');
    await user.click(screen.getByRole('button', { name: /submit assignment/i }));

    expect(await screen.findByText(/enter a valid url/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('disables the submit button and shows a pending label while submitting', () => {
    render(<SubmissionForm isPending={true} onSubmit={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: /submitting/i }),
    ).toBeDisabled();
  });
});
