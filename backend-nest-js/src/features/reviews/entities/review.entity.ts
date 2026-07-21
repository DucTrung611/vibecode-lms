import { Review, User } from '@prisma/client';

export interface ReviewStudentSummary {
  id: string;
  fullName: string;
}

export class ReviewEntity {
  id: string;
  courseId: string;
  studentId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  student?: ReviewStudentSummary;

  static fromPrisma(review: Review & { student?: User }): ReviewEntity {
    const entity = new ReviewEntity();
    entity.id = review.id;
    entity.courseId = review.courseId;
    entity.studentId = review.studentId;
    entity.rating = review.rating;
    entity.comment = review.comment;
    entity.createdAt = review.createdAt;
    if (review.student) {
      entity.student = {
        id: review.student.id,
        fullName: review.student.fullName,
      };
    }
    return entity;
  }
}
