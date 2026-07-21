import { Question, QuestionOption, Quiz } from '@prisma/client';

export class QuestionOptionEntity {
  id: string;
  content: string;

  static fromPrisma(option: QuestionOption): QuestionOptionEntity {
    const entity = new QuestionOptionEntity();
    entity.id = option.id;
    entity.content = option.content;
    return entity;
  }
}

export class QuestionEntity {
  id: string;
  type: string;
  content: string;
  points: number;
  order: number;
  options?: QuestionOptionEntity[];

  static fromPrisma(
    question: Question & { options?: QuestionOption[] },
  ): QuestionEntity {
    const entity = new QuestionEntity();
    entity.id = question.id;
    entity.type = question.type;
    entity.content = question.content;
    entity.points = question.points;
    entity.order = question.order;
    if (question.options) {
      entity.options = question.options.map((option) =>
        QuestionOptionEntity.fromPrisma(option),
      );
    }
    return entity;
  }
}

export class QuizEntity {
  id: string;
  lessonId: string | null;
  title: string;
  isAiGenerated: boolean;
  passScore: number;
  timeLimitSec: number | null;
  questions?: QuestionEntity[];

  static fromPrisma(
    quiz: Quiz & { questions?: (Question & { options: QuestionOption[] })[] },
  ): QuizEntity {
    const entity = new QuizEntity();
    entity.id = quiz.id;
    entity.lessonId = quiz.lessonId;
    entity.title = quiz.title;
    entity.isAiGenerated = quiz.isAiGenerated;
    entity.passScore = quiz.passScore;
    entity.timeLimitSec = quiz.timeLimitSec;
    if (quiz.questions) {
      entity.questions = quiz.questions
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((question) => QuestionEntity.fromPrisma(question));
    }
    return entity;
  }
}
