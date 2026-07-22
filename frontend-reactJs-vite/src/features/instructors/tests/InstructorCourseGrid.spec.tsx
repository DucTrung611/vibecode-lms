import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InstructorCourseGrid } from '../components/InstructorCourseGrid';
import { useInstructorCourses } from '../hooks/useInstructorCourses';

vi.mock('../hooks/useInstructorCourses');

const fakeCourse = {
  id: 'course_1',
  title: 'Intro to Algebra',
  slug: 'intro-to-algebra',
  description: 'desc',
  thumbnailUrl: null,
  price: 0,
  level: 'BEGINNER' as const,
  status: 'PUBLISHED' as const,
  instructorId: 'instructor_1',
  categoryId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function mockHook(value: Partial<ReturnType<typeof useInstructorCourses>>) {
  vi.mocked(useInstructorCourses).mockReturnValue(
    value as ReturnType<typeof useInstructorCourses>,
  );
}

describe('InstructorCourseGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows an empty state when there are no published courses', () => {
    mockHook({
      isPending: false,
      isError: false,
      data: { items: [], meta: { page: 1, limit: 12, total: 0 } },
    });

    render(
      <InstructorCourseGrid
        instructorId="instructor_1"
        page={1}
        onPageChange={vi.fn()}
      />,
      { wrapper: MemoryRouter },
    );

    expect(
      screen.getByText("This instructor hasn't published any courses yet."),
    ).toBeInTheDocument();
  });

  it('renders a CourseCard for each item', () => {
    mockHook({
      isPending: false,
      isError: false,
      data: { items: [fakeCourse], meta: { page: 1, limit: 12, total: 1 } },
    });

    render(
      <InstructorCourseGrid
        instructorId="instructor_1"
        page={1}
        onPageChange={vi.fn()}
      />,
      { wrapper: MemoryRouter },
    );

    expect(screen.getByText('Intro to Algebra')).toBeInTheDocument();
  });

  it('shows pagination only when there is more than one page', () => {
    mockHook({
      isPending: false,
      isError: false,
      data: {
        items: [fakeCourse],
        meta: { page: 1, limit: 1, total: 2 },
      },
    });

    render(
      <InstructorCourseGrid
        instructorId="instructor_1"
        page={1}
        onPageChange={vi.fn()}
      />,
      { wrapper: MemoryRouter },
    );

    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument();
  });

  it('shows an error state when the query fails', () => {
    mockHook({ isPending: false, isError: true, data: undefined });

    render(
      <InstructorCourseGrid
        instructorId="instructor_1"
        page={1}
        onPageChange={vi.fn()}
      />,
      { wrapper: MemoryRouter },
    );

    expect(
      screen.getByText("Could not load this instructor's courses."),
    ).toBeInTheDocument();
  });
});
