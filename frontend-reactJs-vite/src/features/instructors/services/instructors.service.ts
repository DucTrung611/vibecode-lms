import { api, unwrap } from '@/shared/services/api';
import type { ApiSuccess } from '@/shared/types/api.types';
import type { Course } from '@/features/courses';
import type { InstructorProfile } from '../types/instructors.types';

export const instructorsService = {
  getProfile: (id: string) =>
    api.get<ApiSuccess<InstructorProfile>>(`/instructors/${id}`).then(unwrap),

  getCourses: async (id: string, page: number, limit: number) => {
    const response = await api.get<ApiSuccess<Course[]>>(
      `/instructors/${id}/courses`,
      { params: { page, limit } },
    );
    return { items: response.data.data, meta: response.data.meta! };
  },
};
