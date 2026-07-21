import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AddModuleForm } from '../components/AddModuleForm';

describe('AddModuleForm', () => {
  it('shows a validation error and does not submit for an empty title', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<AddModuleForm isPending={false} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /add module/i }));

    expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the title and clears the input', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<AddModuleForm isPending={false} onSubmit={onSubmit} />);

    const input = screen.getByLabelText(/new module title/i);
    await user.type(input, 'Module 1');
    await user.click(screen.getByRole('button', { name: /add module/i }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ title: 'Module 1' }),
    );
    await waitFor(() => expect(input).toHaveValue(''));
  });

  it('disables the submit button while pending', () => {
    render(<AddModuleForm isPending={true} onSubmit={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: /add module/i }),
    ).toBeDisabled();
  });
});
