import { AssignmentSubmission, User } from '@prisma/client';

export class AssignmentSubmissionEntity {
  id: string;
  assignmentId: string;
  studentId: string;
  fileUrl: string | null;
  content: string | null;
  submittedAt: Date;
  score: number | null;
  feedback: string | null;
  gradedById: string | null;
  gradedAt: Date | null;
  student?: { id: string; fullName: string };

  static fromPrisma(
    submission: AssignmentSubmission & {
      student?: Pick<User, 'id' | 'fullName'>;
    },
  ): AssignmentSubmissionEntity {
    const entity = new AssignmentSubmissionEntity();
    entity.id = submission.id;
    entity.assignmentId = submission.assignmentId;
    entity.studentId = submission.studentId;
    entity.fileUrl = submission.fileUrl;
    entity.content = submission.content;
    entity.submittedAt = submission.submittedAt;
    entity.score = submission.score;
    entity.feedback = submission.feedback;
    entity.gradedById = submission.gradedById;
    entity.gradedAt = submission.gradedAt;
    if (submission.student) {
      entity.student = {
        id: submission.student.id,
        fullName: submission.student.fullName,
      };
    }
    return entity;
  }
}
