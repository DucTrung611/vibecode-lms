import { Course, Enrollment } from '@prisma/client';

export interface EnrollmentCourseSummary {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
}

export class EnrollmentEntity {
  id: string;
  studentId: string;
  courseId: string;
  status: string;
  enrolledAt: Date;
  completedAt: Date | null;
  course?: EnrollmentCourseSummary;

  static fromPrisma(
    enrollment: Enrollment & { course?: Course },
  ): EnrollmentEntity {
    const entity = new EnrollmentEntity();
    entity.id = enrollment.id;
    entity.studentId = enrollment.studentId;
    entity.courseId = enrollment.courseId;
    entity.status = enrollment.status;
    entity.enrolledAt = enrollment.enrolledAt;
    entity.completedAt = enrollment.completedAt;
    if (enrollment.course) {
      entity.course = {
        id: enrollment.course.id,
        title: enrollment.course.title,
        slug: enrollment.course.slug,
        thumbnailUrl: enrollment.course.thumbnailUrl,
      };
    }
    return entity;
  }
}
