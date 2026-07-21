import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReviewCard } from '../components/ReviewCard';
import type { Review } from '../types/review.types';

const review: Review = {
  id: 'rev_1',
  courseId: 'course_1',
  studentId: 'student_1',
  rating: 4,
  comment: 'Really enjoyed this course',
  createdAt: '2026-01-15T00:00:00.000Z',
  student: { id: 'student_1', fullName: 'Jane Doe' },
};

describe('ReviewCard', () => {
  it('shows the reviewer name, rating, and comment', () => {
    render(<ReviewCard review={review} />);

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Really enjoyed this course')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4 stars' })).toBeDisabled();
  });

  it('falls back to "Anonymous" when no student summary is present', () => {
    render(<ReviewCard review={{ ...review, student: undefined }} />);

    expect(screen.getByText('Anonymous')).toBeInTheDocument();
  });

  it('omits the comment paragraph when there is no comment', () => {
    render(<ReviewCard review={{ ...review, comment: null }} />);

    expect(
      screen.queryByText('Really enjoyed this course'),
    ).not.toBeInTheDocument();
  });
});
