import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { EditLessonForm } from '../components/EditLessonForm';
import type { Lesson } from '../types/courses.types';

const baseLesson: Lesson = {
  id: 'lesson_1',
  moduleId: 'module_1',
  title: 'Intro video',
  type: 'VIDEO',
  videoUrl: 'https://example.com/video.mp4',
  content: null,
  durationSec: null,
  order: 0,
  quizId: null,
  assignmentId: null,
};

describe('EditLessonForm', () => {
  it('pre-fills the fields from the given lesson', () => {
    render(
      <EditLessonForm
        lesson={baseLesson}
        isPending={false}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
      { wrapper: createWrapper(createTestQueryClient()) },
    );

    expect(screen.getByLabelText(/lesson title/i)).toHaveValue('Intro video');
    expect(screen.getByLabelText(/video url/i)).toHaveValue(
      'https://example.com/video.mp4',
    );
  });

  it('submits the edited values', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <EditLessonForm
        lesson={baseLesson}
        isPending={false}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
      { wrapper: createWrapper(createTestQueryClient()) },
    );

    const titleInput = screen.getByLabelText(/lesson title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated title');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Updated title',
        type: 'VIDEO',
        videoUrl: 'https://example.com/video.mp4',
      }),
    );
  });

  it('calls onCancel without submitting', async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(
      <EditLessonForm
        lesson={baseLesson}
        isPending={false}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />,
      { wrapper: createWrapper(createTestQueryClient()) },
    );

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows the content field instead of video URL for a TEXT lesson', () => {
    render(
      <EditLessonForm
        lesson={{ ...baseLesson, type: 'TEXT', content: 'Some text' }}
        isPending={false}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
      { wrapper: createWrapper(createTestQueryClient()) },
    );

    expect(screen.getByLabelText(/lesson content/i)).toHaveValue('Some text');
    expect(screen.queryByLabelText(/video url/i)).not.toBeInTheDocument();
  });

  it('disables the save button while pending', () => {
    render(
      <EditLessonForm
        lesson={baseLesson}
        isPending={true}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
      { wrapper: createWrapper(createTestQueryClient()) },
    );

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });
});
