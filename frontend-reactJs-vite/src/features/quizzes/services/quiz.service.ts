import { api, unwrap } from '@/shared/services/api';
import type { ApiSuccess } from '@/shared/types/api.types';
import type {
  Quiz,
  QuizAttempt,
  SubmitAttemptPayload,
  SubmitAttemptResult,
} from '../types/quiz.types';

export const quizService = {
  getById: (id: string) =>
    api.get<ApiSuccess<Quiz>>(`/quizzes/${id}`).then(unwrap),

  startAttempt: (quizId: string) =>
    api
      .post<ApiSuccess<QuizAttempt>>(`/quizzes/${quizId}/attempts`)
      .then(unwrap),

  submitAttempt: (attemptId: string, payload: SubmitAttemptPayload) =>
    api
      .post<ApiSuccess<SubmitAttemptResult>>(
        `/attempts/${attemptId}/submit`,
        payload,
      )
      .then(unwrap),
};
