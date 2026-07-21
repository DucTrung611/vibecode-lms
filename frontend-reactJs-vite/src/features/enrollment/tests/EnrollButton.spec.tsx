import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/shared/stores/auth.store';
import { EnrollButton } from '../components/EnrollButton';
import { useEnroll } from '../hooks/useEnroll';

vi.mock('../hooks/useEnroll');

const studentUser = {
  id: 'student_1',
  email: 's@b.com',
  fullName: 'Student One',
  role: 'STUDENT' as const,
};
const instructorUser = { ...studentUser, id: 'instr_1', role: 'INSTRUCTOR' as const };

describe('EnrollButton', () => {
  const mutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useEnroll).mockReturnValue({
      mutate,
      isPending: false,
      isSuccess: false,
    } as unknown as ReturnType<typeof useEnroll>);
  });

  afterEach(() => {
    useAuthStore.getState().clearSession();
  });

  it('shows a sign-in prompt when there is no authenticated user', () => {
    render(<EnrollButton courseId="course_1" />, { wrapper: MemoryRouter });

    expect(
      screen.getByRole('link', { name: /sign in to enroll/i }),
    ).toHaveAttribute('href', '/login');
  });

  it('renders nothing for a non-student (instructor) user', () => {
    useAuthStore.setState({ user: instructorUser });
    const { container } = render(<EnrollButton courseId="course_1" />, {
      wrapper: MemoryRouter,
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('submits the enroll mutation with the course id for a student', async () => {
    useAuthStore.setState({ user: studentUser });
    const user = userEvent.setup();
    render(<EnrollButton courseId="course_1" />, { wrapper: MemoryRouter });

    await user.click(screen.getByRole('button', { name: /^enroll$/i }));

    expect(mutate).toHaveBeenCalledWith('course_1');
  });

  it('disables the button and shows a pending label while enrolling', () => {
    useAuthStore.setState({ user: studentUser });
    vi.mocked(useEnroll).mockReturnValue({
      mutate,
      isPending: true,
      isSuccess: false,
    } as unknown as ReturnType<typeof useEnroll>);

    render(<EnrollButton courseId="course_1" />, { wrapper: MemoryRouter });

    expect(screen.getByRole('button', { name: /enrolling/i })).toBeDisabled();
  });

  it('shows a success state once enrolled', () => {
    useAuthStore.setState({ user: studentUser });
    vi.mocked(useEnroll).mockReturnValue({
      mutate,
      isPending: false,
      isSuccess: true,
    } as unknown as ReturnType<typeof useEnroll>);

    render(<EnrollButton courseId="course_1" />, { wrapper: MemoryRouter });

    expect(screen.getByText(/enrolled/i)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
