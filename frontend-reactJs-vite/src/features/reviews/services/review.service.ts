import { api, unwrap } from '@/shared/services/api';
import type { ApiSuccess } from '@/shared/types/api.types';
import type { CreateReviewPayload, Review } from '../types/review.types';

export const reviewService = {
  listByCourse: async (courseId: string, page: number, limit: number) => {
    const response = await api.get<ApiSuccess<Review[]>>(
      `/courses/${courseId}/reviews`,
      { params: { page, limit } },
    );
    return { items: response.data.data, meta: response.data.meta! };
  },

  create: (courseId: string, payload: CreateReviewPayload) =>
    api
      .post<ApiSuccess<Review>>(`/courses/${courseId}/reviews`, payload)
      .then(unwrap),
};
