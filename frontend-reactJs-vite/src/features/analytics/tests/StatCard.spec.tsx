import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatCard } from '../components/StatCard';

describe('StatCard', () => {
  it('renders the label and value', () => {
    render(<StatCard label="Students" value="15" />);

    expect(screen.getByText('Students')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('renders an optional sub-label', () => {
    render(<StatCard label="Average rating" value="4.5 ★" subLabel="4 reviews" />);

    expect(screen.getByText('4 reviews')).toBeInTheDocument();
  });
});
