import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { CourseModuleList } from '../components/CourseModuleList';
import type { CourseModule } from '../types/courses.types';

const modules: CourseModule[] = [
  {
    id: 'module_1',
    courseId: 'course_1',
    title: 'Getting Started',
    order: 0,
    lessons: [
      {
        id: 'lesson_1',
        moduleId: 'module_1',
        title: 'Watch the intro',
        type: 'VIDEO',
        videoUrl: 'https://example.com/intro.mp4',
        content: null,
        durationSec: 120,
        order: 0,
        quizId: null,
        assignmentId: null,
      },
      {
        id: 'lesson_2',
        moduleId: 'module_1',
        title: 'Check your understanding',
        type: 'QUIZ',
        videoUrl: null,
        content: null,
        durationSec: null,
        order: 1,
        quizId: 'quiz_1',
        assignmentId: null,
      },
      {
        id: 'lesson_3',
        moduleId: 'module_1',
        title: 'Practice project',
        type: 'ASSIGNMENT',
        videoUrl: null,
        content: null,
        durationSec: null,
        order: 2,
        quizId: null,
        assignmentId: 'assignment_1',
      },
    ],
  },
];

describe('CourseModuleList', () => {
  it('shows a placeholder when there are no modules', () => {
    render(<CourseModuleList courseId="course_1" modules={[]} />, {
      wrapper: MemoryRouter,
    });

    expect(screen.getByText('No modules yet.')).toBeInTheDocument();
  });

  it('links each lesson to its lesson-viewer page', () => {
    render(<CourseModuleList courseId="course_1" modules={modules} />, {
      wrapper: MemoryRouter,
    });

    expect(
      screen.getByRole('link', { name: 'Watch the intro' }),
    ).toHaveAttribute('href', '/courses/course_1/lessons/lesson_1');
  });

  it('shows a "Take quiz" link only for lessons with a linked quiz', () => {
    render(<CourseModuleList courseId="course_1" modules={modules} />, {
      wrapper: MemoryRouter,
    });

    expect(screen.getByRole('link', { name: 'Take quiz' })).toHaveAttribute(
      'href',
      '/quizzes/quiz_1/attempt',
    );
    expect(screen.getAllByRole('link', { name: 'Take quiz' })).toHaveLength(1);
  });

  it('shows a "View assignment" link only for lessons with a linked assignment', () => {
    render(<CourseModuleList courseId="course_1" modules={modules} />, {
      wrapper: MemoryRouter,
    });

    expect(
      screen.getByRole('link', { name: 'View assignment' }),
    ).toHaveAttribute('href', '/assignments/assignment_1/submit');
  });
});
