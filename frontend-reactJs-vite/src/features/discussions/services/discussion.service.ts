import { api, unwrap } from '@/shared/services/api';
import type { ApiSuccess } from '@/shared/types/api.types';
import type {
  CreateAnswerPayload,
  CreateQuestionPayload,
  LessonAnswer,
  LessonQuestion,
} from '../types/discussion.types';

export const discussionService = {
  listByLesson: async (lessonId: string, page: number, limit: number) => {
    const response = await api.get<ApiSuccess<LessonQuestion[]>>(
      `/lessons/${lessonId}/questions`,
      { params: { page, limit } },
    );
    return { items: response.data.data, meta: response.data.meta! };
  },

  createQuestion: (lessonId: string, payload: CreateQuestionPayload) =>
    api
      .post<ApiSuccess<LessonQuestion>>(`/lessons/${lessonId}/questions`, payload)
      .then(unwrap),

  createAnswer: (questionId: string, payload: CreateAnswerPayload) =>
    api
      .post<ApiSuccess<LessonAnswer>>(`/questions/${questionId}/answers`, payload)
      .then(unwrap),
};
