import { api, unwrap } from '@/shared/services/api';
import type { ApiSuccess } from '@/shared/types/api.types';
import type {
  Enrollment,
  EnrollResponse,
  LessonProgress,
  UpdateProgressPayload,
} from '../types/enrollment.types';

export const enrollmentService = {
  enroll: (courseId: string) =>
    api
      .post<ApiSuccess<EnrollResponse>>(`/courses/${courseId}/enroll`)
      .then(unwrap),

  listMine: async (page: number, limit: number) => {
    const response = await api.get<ApiSuccess<Enrollment[]>>(
      '/enrollments/me',
      { params: { page, limit } },
    );
    return { items: response.data.data, meta: response.data.meta! };
  },

  updateProgress: (enrollmentId: string, payload: UpdateProgressPayload) =>
    api
      .patch<ApiSuccess<LessonProgress>>(
        `/enrollments/${enrollmentId}/progress`,
        payload,
      )
      .then(unwrap),
};
