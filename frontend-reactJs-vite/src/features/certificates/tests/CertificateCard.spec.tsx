import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CertificateCard } from '../components/CertificateCard';
import type { Certificate } from '../types/certificate.types';

const certificate: Certificate = {
  id: 'cert_1',
  studentId: 'student_1',
  courseId: 'course_1',
  certificateCode: 'ABC123',
  certificateUrl: '/certificates/ABC123.pdf',
  issuedAt: '2026-01-15T00:00:00.000Z',
  course: { id: 'course_1', title: 'Intro to Algebra', slug: 'intro-to-algebra' },
};

describe('CertificateCard', () => {
  it('shows the course title, code, and a link to the certificate url', () => {
    render(<CertificateCard certificate={certificate} />);

    expect(screen.getByText('Intro to Algebra')).toBeInTheDocument();
    expect(screen.getByText('ABC123')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view/i })).toHaveAttribute(
      'href',
      '/certificates/ABC123.pdf',
    );
  });

  it('falls back to "Untitled course" when no course summary is present', () => {
    render(<CertificateCard certificate={{ ...certificate, course: undefined }} />);

    expect(screen.getByText('Untitled course')).toBeInTheDocument();
  });
});
