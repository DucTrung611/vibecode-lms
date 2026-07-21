import { Certificate, Course, User } from '@prisma/client';

export interface CertificateCourseSummary {
  id: string;
  title: string;
  slug: string;
}

export interface CertificateStudentSummary {
  id: string;
  fullName: string;
}

export class CertificateEntity {
  id: string;
  studentId: string;
  courseId: string;
  certificateCode: string;
  certificateUrl: string;
  issuedAt: Date;
  course?: CertificateCourseSummary;
  student?: CertificateStudentSummary;

  static fromPrisma(
    certificate: Certificate & { course?: Course; student?: User },
  ): CertificateEntity {
    const entity = new CertificateEntity();
    entity.id = certificate.id;
    entity.studentId = certificate.studentId;
    entity.courseId = certificate.courseId;
    entity.certificateCode = certificate.certificateCode;
    entity.certificateUrl = certificate.certificateUrl;
    entity.issuedAt = certificate.issuedAt;
    if (certificate.course) {
      entity.course = {
        id: certificate.course.id,
        title: certificate.course.title,
        slug: certificate.course.slug,
      };
    }
    if (certificate.student) {
      entity.student = {
        id: certificate.student.id,
        fullName: certificate.student.fullName,
      };
    }
    return entity;
  }
}
