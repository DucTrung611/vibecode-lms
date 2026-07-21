export interface AnswerInput {
  questionId: string;
  selectedOptionId?: string;
  answerText?: string;
}

export interface GradedAnswer {
  questionId: string;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface ScoringResult {
  answers: GradedAnswer[];
  score: number;
  passed: boolean;
}
