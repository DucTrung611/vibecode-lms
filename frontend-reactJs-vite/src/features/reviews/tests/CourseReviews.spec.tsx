import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/shared/stores/auth.store';
import { CourseReviews } from '../components/CourseReviews';
import { useCourseReviews } from '../hooks/useCourseReviews';
import { useCreateReview } from '../hooks/useCreateReview';

vi.mock('../hooks/useCourseReviews');
vi.mock('../hooks/useCreateReview');

const studentUser = {
  id: 'student_1',
  email: 's@b.com',
  fullName: 'Student One',
  role: 'STUDENT' as const,
};
const instructorUser = { ...studentUser, id: 'instr_1', role: 'INSTRUCTOR' as const };

describe('CourseReviews', () => {
  const mutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCourseReviews).mockReturnValue({
      data: { items: [], meta: { page: 1, limit: 20, total: 0 } },
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useCourseReviews>);
    vi.mocked(useCreateReview).mockReturnValue({
      mutate,
      isPending: false,
      isSuccess: false,
    } as unknown as ReturnType<typeof useCreateReview>);
  });

  afterEach(() => {
    useAuthStore.getState().clearSession();
  });

  it('does not show the review form for an unauthenticated visitor', () => {
    render(<CourseReviews courseId="course_1" />);

    expect(
      screen.queryByRole('button', { name: /post review/i }),
    ).not.toBeInTheDocument();
  });

  it('does not show the review form for a non-student (instructor) user', () => {
    useAuthStore.setState({ user: instructorUser });

    render(<CourseReviews courseId="course_1" />);

    expect(
      screen.queryByRole('button', { name: /post review/i }),
    ).not.toBeInTheDocument();
  });

  it('shows the review form for a student', () => {
    useAuthStore.setState({ user: studentUser });

    render(<CourseReviews courseId="course_1" />);

    expect(
      screen.getByRole('button', { name: /post review/i }),
    ).toBeInTheDocument();
  });

  it('hides the form once a review has been posted successfully', () => {
    useAuthStore.setState({ user: studentUser });
    vi.mocked(useCreateReview).mockReturnValue({
      mutate,
      isPending: false,
      isSuccess: true,
    } as unknown as ReturnType<typeof useCreateReview>);

    render(<CourseReviews courseId="course_1" />);

    expect(
      screen.queryByRole('button', { name: /post review/i }),
    ).not.toBeInTheDocument();
  });
});
