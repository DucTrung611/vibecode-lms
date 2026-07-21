import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LearningPathCard } from '../components/LearningPathCard';
import { useEnrollLearningPath } from '../hooks/useEnrollLearningPath';
import type { LearningPath } from '../types/learning-path.types';

vi.mock('../hooks/useEnrollLearningPath');

const path: LearningPath = {
  id: 'path_1',
  title: 'Frontend Foundations',
  description: 'From HTML to React',
  createdById: null,
  isAiGenerated: true,
  items: [
    {
      id: 'item_1',
      learningPathId: 'path_1',
      courseId: 'course_1',
      order: 0,
      course: { id: 'course_1', title: 'Intro to HTML', thumbnailUrl: null, price: 0 },
    },
  ],
};

describe('LearningPathCard', () => {
  beforeEach(() => {
    vi.mocked(useEnrollLearningPath).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isSuccess: false,
    } as unknown as ReturnType<typeof useEnrollLearningPath>);
  });

  it('shows the title, description, AI badge, and item course titles', () => {
    render(<LearningPathCard path={path} />, { wrapper: MemoryRouter });

    expect(screen.getByText('Frontend Foundations')).toBeInTheDocument();
    expect(screen.getByText('From HTML to React')).toBeInTheDocument();
    expect(screen.getByText('AI-generated')).toBeInTheDocument();
    expect(screen.getByText('Intro to HTML')).toBeInTheDocument();
  });

  it('omits the AI badge for a manually curated path', () => {
    render(<LearningPathCard path={{ ...path, isAiGenerated: false }} />, {
      wrapper: MemoryRouter,
    });

    expect(screen.queryByText('AI-generated')).not.toBeInTheDocument();
  });

  it('falls back to "Untitled course" when an item has no course summary', () => {
    const [item] = path.items ?? [];
    render(
      <LearningPathCard
        path={{ ...path, items: [{ ...item, course: undefined }] }}
      />,
      { wrapper: MemoryRouter },
    );

    expect(screen.getByText('Untitled course')).toBeInTheDocument();
  });
});
