import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegisterForm } from '../components/RegisterForm';
import { useRegister } from '../hooks/useRegister';

vi.mock('../hooks/useRegister');

describe('RegisterForm', () => {
  const mutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRegister).mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useRegister>);
  });

  it('submits the mutation with the filled fields and default STUDENT role', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />, { wrapper: MemoryRouter });

    await user.type(screen.getByLabelText(/full name/i), 'A B');
    await user.type(screen.getByLabelText(/email/i), 'a@b.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith({
        fullName: 'A B',
        email: 'a@b.com',
        password: 'password123',
        role: 'STUDENT',
      }),
    );
  });

  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />, { wrapper: MemoryRouter });

    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/full name is required/i)).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('disables the submit button while the mutation is pending', () => {
    vi.mocked(useRegister).mockReturnValue({
      mutate,
      isPending: true,
    } as unknown as ReturnType<typeof useRegister>);

    render(<RegisterForm />, { wrapper: MemoryRouter });

    expect(
      screen.getByRole('button', { name: /creating account/i }),
    ).toBeDisabled();
  });
});
