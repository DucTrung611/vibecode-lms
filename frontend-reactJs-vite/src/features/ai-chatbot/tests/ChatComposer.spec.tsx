import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ChatComposer } from '../components/ChatComposer';

describe('ChatComposer', () => {
  it('submits the trimmed message and clears the input', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatComposer onSend={onSend} isPending={false} />);

    const input = screen.getByLabelText('Message');
    await user.type(input, '  What is a right triangle?  ');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(onSend).toHaveBeenCalledWith('What is a right triangle?');
    expect(input).toHaveValue('');
  });

  it('does not submit an empty or whitespace-only message', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatComposer onSend={onSend} isPending={false} />);

    await user.type(screen.getByLabelText('Message'), '   ');
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();

    expect(onSend).not.toHaveBeenCalled();
  });

  it('disables the input and button while pending', () => {
    render(<ChatComposer onSend={vi.fn()} isPending={true} />);

    expect(screen.getByLabelText('Message')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Sending…' })).toBeDisabled();
  });
});
