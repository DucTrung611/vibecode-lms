import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/shared/stores/auth.store';
import { LearningPathEnrollButton } from '../components/LearningPathEnrollButton';
import { useEnrollLearningPath } from '../hooks/useEnrollLearningPath';

vi.mock('../hooks/useEnrollLearningPath');

const studentUser = {
  id: 'student_1',
  email: 's@b.com',
  fullName: 'Student One',
  role: 'STUDENT' as const,
};
const instructorUser = {
  ...studentUser,
  id: 'instr_1',
  role: 'INSTRUCTOR' as const,
};

describe('LearningPathEnrollButton', () => {
  const mutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useEnrollLearningPath).mockReturnValue({
      mutate,
      isPending: false,
      isSuccess: false,
    } as unknown as ReturnType<typeof useEnrollLearningPath>);
  });

  afterEach(() => {
    useAuthStore.getState().clearSession();
  });

  it('shows a sign-in prompt when there is no authenticated user', () => {
    render(<LearningPathEnrollButton learningPathId="path_1" />, {
      wrapper: MemoryRouter,
    });

    expect(
      screen.getByRole('link', { name: /sign in to enroll/i }),
    ).toHaveAttribute('href', '/login');
  });

  it('renders nothing for a non-student (instructor) user', () => {
    useAuthStore.setState({ user: instructorUser });
    const { container } = render(
      <LearningPathEnrollButton learningPathId="path_1" />,
      { wrapper: MemoryRouter },
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('submits the enroll mutation with the path id for a student', async () => {
    useAuthStore.setState({ user: studentUser });
    const user = userEvent.setup();
    render(<LearningPathEnrollButton learningPathId="path_1" />, {
      wrapper: MemoryRouter,
    });

    await user.click(screen.getByRole('button', { name: /^enroll$/i }));

    expect(mutate).toHaveBeenCalledWith('path_1');
  });

  it('shows a success state once enrolled', () => {
    useAuthStore.setState({ user: studentUser });
    vi.mocked(useEnrollLearningPath).mockReturnValue({
      mutate,
      isPending: false,
      isSuccess: true,
    } as unknown as ReturnType<typeof useEnrollLearningPath>);

    render(<LearningPathEnrollButton learningPathId="path_1" />, {
      wrapper: MemoryRouter,
    });

    expect(screen.getByText(/enrolled/i)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
