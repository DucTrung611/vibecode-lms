import { QuizAttempt } from '@prisma/client';

export class QuizAttemptEntity {
  id: string;
  quizId: string;
  studentId: string;
  score: number | null;
  startedAt: Date;
  submittedAt: Date | null;

  static fromPrisma(attempt: QuizAttempt): QuizAttemptEntity {
    const entity = new QuizAttemptEntity();
    entity.id = attempt.id;
    entity.quizId = attempt.quizId;
    entity.studentId = attempt.studentId;
    entity.score = attempt.score;
    entity.startedAt = attempt.startedAt;
    entity.submittedAt = attempt.submittedAt;
    return entity;
  }
}
