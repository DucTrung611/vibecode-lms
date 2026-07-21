import { Assignment } from '@prisma/client';

export class AssignmentEntity {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  dueDate: Date | null;
  maxScore: number;

  static fromPrisma(assignment: Assignment): AssignmentEntity {
    const entity = new AssignmentEntity();
    entity.id = assignment.id;
    entity.lessonId = assignment.lessonId;
    entity.title = assignment.title;
    entity.description = assignment.description;
    entity.dueDate = assignment.dueDate;
    entity.maxScore = assignment.maxScore;
    return entity;
  }
}
