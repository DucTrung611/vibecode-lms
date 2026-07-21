import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { VerifyCodeForm } from '../components/VerifyCodeForm';

describe('VerifyCodeForm', () => {
  it('submits the trimmed code', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<VerifyCodeForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/certificate code/i), '  ABC123  ');
    await user.click(screen.getByRole('button', { name: /verify/i }));

    expect(onSubmit).toHaveBeenCalledWith('ABC123');
  });

  it('does not submit an empty/whitespace-only code', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<VerifyCodeForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/certificate code/i), '   ');
    await user.click(screen.getByRole('button', { name: /verify/i }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
