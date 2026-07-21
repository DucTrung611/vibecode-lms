import { create } from 'zustand';
import type { SubmitAnswerPayload } from '../types/quiz.types';

interface QuizAttemptState {
  attemptId: string | null;
  answers: Record<string, SubmitAnswerPayload>;
  setAttemptId: (attemptId: string) => void;
  setAnswer: (answer: SubmitAnswerPayload) => void;
  reset: () => void;
}

export const useQuizAttemptStore = create<QuizAttemptState>((set) => ({
  attemptId: null,
  answers: {},
  setAttemptId: (attemptId) => set({ attemptId }),
  setAnswer: (answer) =>
    set((state) => ({
      answers: { ...state.answers, [answer.questionId]: answer },
    })),
  reset: () => set({ attemptId: null, answers: {} }),
}));
