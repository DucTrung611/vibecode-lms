export interface CertificateCourseSummary {
  id: string;
  title: string;
  slug: string;
}

export interface CertificateStudentSummary {
  id: string;
  fullName: string;
}

export interface Certificate {
  id: string;
  studentId: string;
  courseId: string;
  certificateCode: string;
  certificateUrl: string;
  issuedAt: string;
  course?: CertificateCourseSummary;
  student?: CertificateStudentSummary;
}
