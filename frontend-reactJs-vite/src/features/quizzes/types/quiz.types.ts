export const QUESTION_TYPES = ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TEXT'] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export interface QuestionOption {
  id: string;
  content: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  content: string;
  points: number;
  order: number;
  options?: QuestionOption[];
}

export interface Quiz {
  id: string;
  lessonId: string | null;
  title: string;
  isAiGenerated: boolean;
  passScore: number;
  timeLimitSec: number | null;
  questions?: Question[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  score: number | null;
  startedAt: string;
  submittedAt: string | null;
}

export interface SubmitAnswerPayload {
  questionId: string;
  selectedOptionId?: string;
  answerText?: string;
}

export interface SubmitAttemptPayload {
  answers: SubmitAnswerPayload[];
}

export interface GradedAnswer {
  questionId: string;
  isCorrect: boolean;
}

export interface SubmitAttemptResult {
  attemptId: string;
  score: number;
  passed: boolean;
  answers: GradedAnswer[];
}
