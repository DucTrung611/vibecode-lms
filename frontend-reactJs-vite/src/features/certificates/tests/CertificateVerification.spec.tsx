import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CertificateVerification } from '../components/CertificateVerification';
import type { Certificate } from '../types/certificate.types';

const certificate: Certificate = {
  id: 'cert_1',
  studentId: 'student_1',
  courseId: 'course_1',
  certificateCode: 'ABC123',
  certificateUrl: '/certificates/ABC123.pdf',
  issuedAt: '2026-01-15T00:00:00.000Z',
  course: { id: 'course_1', title: 'Intro to Algebra', slug: 'intro-to-algebra' },
  student: { id: 'student_1', fullName: 'Jane Doe' },
};

describe('CertificateVerification', () => {
  it('shows the course, student, and code for a valid certificate', () => {
    render(<CertificateVerification certificate={certificate} />);

    expect(screen.getByText(/valid certificate/i)).toBeInTheDocument();
    expect(screen.getByText('Intro to Algebra')).toBeInTheDocument();
    expect(screen.getByText(/jane doe/i)).toBeInTheDocument();
    expect(screen.getByText('ABC123')).toBeInTheDocument();
  });

  it('falls back to generic labels when course/student summaries are missing', () => {
    render(
      <CertificateVerification
        certificate={{ ...certificate, course: undefined, student: undefined }}
      />,
    );

    expect(screen.getByText('Untitled course')).toBeInTheDocument();
    expect(screen.getByText(/unknown student/i)).toBeInTheDocument();
  });
});
