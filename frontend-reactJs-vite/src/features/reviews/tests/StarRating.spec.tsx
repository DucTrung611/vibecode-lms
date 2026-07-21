import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { StarRating } from '../components/StarRating';

describe('StarRating', () => {
  it('renders as read-only (disabled buttons) when no onChange is given', () => {
    render(<StarRating rating={3} />);

    for (const star of screen.getAllByRole('button')) {
      expect(star).toBeDisabled();
    }
  });

  it('calls onChange with the clicked star value when interactive', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<StarRating rating={0} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: '4 stars' }));

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('marks stars up to the current rating as pressed when interactive', () => {
    render(<StarRating rating={3} onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: '3 stars' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: '4 stars' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});
