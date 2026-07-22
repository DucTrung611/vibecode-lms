import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { ModuleEditorCard } from '../components/ModuleEditorCard';
import type { CourseModule } from '../types/courses.types';

const baseModule: CourseModule = {
  id: 'module_1',
  courseId: 'course_1',
  title: 'Module 1',
  order: 0,
  lessons: [
    {
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
    },
  ],
};

function renderCard(overrides: Partial<Parameters<typeof ModuleEditorCard>[0]> = {}) {
  return render(
    <ModuleEditorCard
      module={baseModule}
      isAddingLesson={false}
      onAddLesson={vi.fn()}
      isUpdatingLesson={false}
      onUpdateLesson={vi.fn()}
      {...overrides}
    />,
    { wrapper: createWrapper(createTestQueryClient()) },
  );
}

describe('ModuleEditorCard', () => {
  it('shows the static lesson row by default', () => {
    renderCard();

    expect(screen.getByText('Intro video')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('swaps the row for the edit form when Edit is clicked', async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole('button', { name: /edit/i }));

    expect(screen.getByLabelText('Lesson title')).toHaveValue('Intro video');
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('calls onUpdateLesson and closes the form on save', async () => {
    const onUpdateLesson = vi.fn();
    const user = userEvent.setup();
    renderCard({ onUpdateLesson });

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(onUpdateLesson).toHaveBeenCalledWith('lesson_1', {
      title: 'Intro video',
      type: 'VIDEO',
      videoUrl: 'https://example.com/video.mp4',
    });
    expect(await screen.findByText('Intro video')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
  });

  it('reverts to the static row without updating when Cancel is clicked', async () => {
    const onUpdateLesson = vi.fn();
    const user = userEvent.setup();
    renderCard({ onUpdateLesson });

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onUpdateLesson).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });
});
