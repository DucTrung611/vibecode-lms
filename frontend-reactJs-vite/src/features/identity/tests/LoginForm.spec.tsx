import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginForm } from '../components/LoginForm';
import { useLogin } from '../hooks/useLogin';

vi.mock('../hooks/useLogin');

describe('LoginForm', () => {
  const mutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLogin).mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useLogin>);
  });

  it('shows validation errors and does not submit when fields are empty', async () => {
    const user = userEvent.setup();
    render(<LoginForm />, { wrapper: MemoryRouter });

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument();
    expect(
      screen.getByText(/password must be at least 8 characters/i),
    ).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('submits the mutation with valid credentials', async () => {
    const user = userEvent.setup();
    render(<LoginForm />, { wrapper: MemoryRouter });

    await user.type(screen.getByLabelText(/email/i), 'a@b.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith({
        email: 'a@b.com',
        password: 'password123',
      }),
    );
  });

  it('disables the submit button while the mutation is pending', () => {
    vi.mocked(useLogin).mockReturnValue({
      mutate,
      isPending: true,
    } as unknown as ReturnType<typeof useLogin>);

    render(<LoginForm />, { wrapper: MemoryRouter });

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });
});
