export interface GeneratedQuestionOption {
  content: string;
  isCorrect: boolean;
}

export interface GeneratedQuestion {
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  content: string;
  points: number;
  options: GeneratedQuestionOption[];
}
