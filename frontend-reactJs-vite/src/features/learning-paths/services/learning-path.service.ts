import { api, unwrap } from '@/shared/services/api';
import type { ApiSuccess } from '@/shared/types/api.types';
import type {
  LearningPath,
  LearningPathEnrollment,
} from '../types/learning-path.types';

export const learningPathService = {
  list: async (page: number, limit: number) => {
    const response = await api.get<ApiSuccess<LearningPath[]>>(
      '/learning-paths',
      { params: { page, limit } },
    );
    return { items: response.data.data, meta: response.data.meta! };
  },

  enroll: (id: string) =>
    api
      .post<ApiSuccess<LearningPathEnrollment>>(
        `/learning-paths/${id}/enroll`,
      )
      .then(unwrap),
};
