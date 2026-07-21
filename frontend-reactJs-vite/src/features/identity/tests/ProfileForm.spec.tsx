import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfileForm } from '../components/ProfileForm';
import { useUpdateProfile } from '../hooks/useUpdateProfile';

vi.mock('../hooks/useUpdateProfile');

describe('ProfileForm', () => {
  const mutate = vi.fn();
  const user = {
    id: 'u1',
    email: 'a@b.com',
    fullName: 'A B',
    role: 'STUDENT' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUpdateProfile).mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateProfile>);
  });

  it('pre-fills the full name from the current user', () => {
    render(<ProfileForm user={user} />);

    expect(screen.getByLabelText(/full name/i)).toHaveValue('A B');
  });

  it('submits the mutation with the edited fields', async () => {
    const userEventInstance = userEvent.setup();
    render(<ProfileForm user={user} />);

    const fullNameInput = screen.getByLabelText(/full name/i);
    await userEventInstance.clear(fullNameInput);
    await userEventInstance.type(fullNameInput, 'New Name');
    await userEventInstance.click(
      screen.getByRole('button', { name: /save changes/i }),
    );

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith({
        fullName: 'New Name',
        avatarUrl: '',
      }),
    );
  });

  it('disables the submit button while the mutation is pending', () => {
    vi.mocked(useUpdateProfile).mockReturnValue({
      mutate,
      isPending: true,
    } as unknown as ReturnType<typeof useUpdateProfile>);

    render(<ProfileForm user={user} />);

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
  });
});
