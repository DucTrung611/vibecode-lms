import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InstructorHeader } from '../components/InstructorHeader';
import type { InstructorProfile } from '../types/instructors.types';

const baseProfile: InstructorProfile = {
  id: 'instructor_1',
  fullName: 'Prof X',
  avatarUrl: null,
  bio: 'Teaches things.',
  stats: {
    totalCourses: 2,
    totalStudents: 15,
    averageRating: 4.6,
    reviewCount: 5,
  },
};

describe('InstructorHeader', () => {
  it('renders the name, bio, and stats', () => {
    render(<InstructorHeader profile={baseProfile} />);

    expect(screen.getByText('Prof X')).toBeInTheDocument();
    expect(screen.getByText('Teaches things.')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('4.6 ★')).toBeInTheDocument();
  });

  it('shows a fallback message when there is no bio', () => {
    render(<InstructorHeader profile={{ ...baseProfile, bio: null }} />);

    expect(
      screen.getByText('This instructor has not shared a bio yet.'),
    ).toBeInTheDocument();
  });

  it('shows initials when there is no avatar', () => {
    render(<InstructorHeader profile={baseProfile} />);

    expect(screen.getByText('PX')).toBeInTheDocument();
  });

  it('shows a dash for rating and no rating row when there are no reviews', () => {
    const profile: InstructorProfile = {
      ...baseProfile,
      stats: {
        totalCourses: 0,
        totalStudents: 0,
        averageRating: null,
        reviewCount: 0,
      },
    };
    render(<InstructorHeader profile={profile} />);

    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
