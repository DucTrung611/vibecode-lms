import { Question, QuestionOption, Quiz } from '@prisma/client';

/**
 * Distinct from QuestionOptionEntity/QuestionEntity/QuizEntity: those
 * intentionally hide `isCorrect` for the student-facing GET /quizzes/:id.
 * This endpoint is instructor-only (they just generated it and need to
 * review correctness), so exposing it here is deliberate, not a leak.
 */
export class GeneratedQuestionOptionEntity {
  id: string;
  content: string;
  isCorrect: boolean;

  static fromPrisma(option: QuestionOption): GeneratedQuestionOptionEntity {
    const entity = new GeneratedQuestionOptionEntity();
    entity.id = option.id;
    entity.content = option.content;
    entity.isCorrect = option.isCorrect;
    return entity;
  }
}

export class GeneratedQuestionEntity {
  id: string;
  type: string;
  content: string;
  points: number;
  order: number;
  options: GeneratedQuestionOptionEntity[];

  static fromPrisma(
    question: Question & { options: QuestionOption[] },
  ): GeneratedQuestionEntity {
    const entity = new GeneratedQuestionEntity();
    entity.id = question.id;
    entity.type = question.type;
    entity.content = question.content;
    entity.points = question.points;
    entity.order = question.order;
    entity.options = question.options.map((option) =>
      GeneratedQuestionOptionEntity.fromPrisma(option),
    );
    return entity;
  }
}

export class GeneratedQuizEntity {
  id: string;
  lessonId: string | null;
  title: string;
  isAiGenerated: boolean;
  passScore: number;
  timeLimitSec: number | null;
  questions: GeneratedQuestionEntity[];

  static fromPrisma(
    quiz: Quiz & { questions: (Question & { options: QuestionOption[] })[] },
  ): GeneratedQuizEntity {
    const entity = new GeneratedQuizEntity();
    entity.id = quiz.id;
    entity.lessonId = quiz.lessonId;
    entity.title = quiz.title;
    entity.isAiGenerated = quiz.isAiGenerated;
    entity.passScore = quiz.passScore;
    entity.timeLimitSec = quiz.timeLimitSec;
    entity.questions = quiz.questions.map((question) =>
      GeneratedQuestionEntity.fromPrisma(question),
    );
    return entity;
  }
}
