import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CourseForm } from '../components/CourseForm';

describe('CourseForm', () => {
  it('does not render a status field in create mode', () => {
    render(<CourseForm mode="create" isPending={false} onSubmit={vi.fn()} />);

    expect(screen.queryByLabelText(/status/i)).not.toBeInTheDocument();
  });

  it('renders a status field pre-filled from defaultValues in edit mode', () => {
    render(
      <CourseForm
        mode="edit"
        isPending={false}
        onSubmit={vi.fn()}
        defaultValues={{
          title: 'Intro',
          description: 'desc',
          price: 12,
          level: 'INTERMEDIATE',
          status: 'PUBLISHED',
        }}
      />,
    );

    expect(screen.getByLabelText(/title/i)).toHaveValue('Intro');
    expect(screen.getByLabelText(/status/i)).toHaveValue('PUBLISHED');
  });

  it('shows validation errors and does not submit for empty required fields', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<CourseForm mode="create" isPending={false} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /create course/i }));

    expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
    expect(
      screen.getByText(/description is required/i),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits with the default DRAFT status in create mode', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<CourseForm mode="create" isPending={false} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/title/i), 'Intro to Algebra');
    await user.type(screen.getByLabelText(/description/i), 'A course');
    await user.click(screen.getByRole('button', { name: /create course/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toEqual({
      title: 'Intro to Algebra',
      description: 'A course',
      price: 0,
      level: 'BEGINNER',
      status: 'DRAFT',
      thumbnailUrl: '',
    });
  });

  it('disables the submit button and shows the correct label while pending', () => {
    render(<CourseForm mode="edit" isPending={true} onSubmit={vi.fn()} />);

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
  });
});
