import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '@/app/providers/auth-context';
import { useLogout } from '@/features/identity';
import { useAuthStore } from '@/shared/stores/auth.store';
import { createTestQueryClient } from '@/test/test-utils';
import { Header } from '../Header';

vi.mock('@/app/providers/auth-context');
vi.mock('@/features/identity', () => ({
  useLogout: vi.fn(),
}));

function renderHeader() {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={createTestQueryClient()}>
        <Header />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('Header', () => {
  const logoutMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLogout).mockReturnValue({
      mutate: logoutMutate,
    } as unknown as ReturnType<typeof useLogout>);
  });

  afterEach(() => {
    useAuthStore.getState().clearSession();
  });

  it('shows sign in/up links when unauthenticated', () => {
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: false });

    renderHeader();

    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign up' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Log out' }),
    ).not.toBeInTheDocument();
  });

  it('shows student-only nav links and logs out when clicked', async () => {
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true });
    useAuthStore.setState({
      user: {
        id: 'student_1',
        email: 's@b.com',
        fullName: 'Jane Doe',
        role: 'STUDENT',
      },
    });
    const user = userEvent.setup();

    renderHeader();

    expect(screen.getByRole('link', { name: 'My courses' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Orders' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ask AI' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Jane Doe' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Log out' }));
    expect(logoutMutate).toHaveBeenCalled();
  });

  it('shows an instructor-only nav link instead of student links', () => {
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true });
    useAuthStore.setState({
      user: {
        id: 'instr_1',
        email: 'i@b.com',
        fullName: 'Prof X',
        role: 'INSTRUCTOR',
      },
    });

    renderHeader();

    expect(screen.getByRole('link', { name: 'New course' })).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'My courses' }),
    ).not.toBeInTheDocument();
  });
});
