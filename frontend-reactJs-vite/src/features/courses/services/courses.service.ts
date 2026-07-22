import { api, unwrap } from '@/shared/services/api';
import type { ApiSuccess } from '@/shared/types/api.types';
import type {
  Course,
  CourseLevel,
  CourseListFilters,
  CourseModule,
  CourseStatus,
  Lesson,
  LessonType,
} from '../types/courses.types';

interface CreateCoursePayload {
  title: string;
  description: string;
  thumbnailUrl?: string;
  price: number;
  level: CourseLevel;
  categoryId?: string;
}

interface UpdateCoursePayload {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  price?: number;
  level?: CourseLevel;
  status?: CourseStatus;
  categoryId?: string;
}

interface AddModulePayload {
  title: string;
}

interface AddLessonPayload {
  title: string;
  type: LessonType;
  videoUrl?: string;
  content?: string;
  durationSec?: number;
}

interface UpdateLessonPayload {
  title?: string;
  type?: LessonType;
  videoUrl?: string;
  content?: string;
  durationSec?: number;
}

export const coursesService = {
  list: async (filters: CourseListFilters) => {
    const response = await api.get<ApiSuccess<Course[]>>('/courses', {
      params: filters,
    });
    return { items: response.data.data, meta: response.data.meta! };
  },

  getById: (id: string) =>
    api.get<ApiSuccess<Course>>(`/courses/${id}`).then(unwrap),

  create: (dto: CreateCoursePayload) =>
    api.post<ApiSuccess<Course>>('/courses', dto).then(unwrap),

  update: (id: string, dto: UpdateCoursePayload) =>
    api.patch<ApiSuccess<Course>>(`/courses/${id}`, dto).then(unwrap),

  remove: (id: string) => api.delete<void>(`/courses/${id}`),

  addModule: (courseId: string, dto: AddModulePayload) =>
    api
      .post<ApiSuccess<CourseModule>>(`/courses/${courseId}/modules`, dto)
      .then(unwrap),

  addLesson: (moduleId: string, dto: AddLessonPayload) =>
    api
      .post<ApiSuccess<Lesson>>(`/modules/${moduleId}/lessons`, dto)
      .then(unwrap),

  updateLesson: (id: string, dto: UpdateLessonPayload) =>
    api.patch<ApiSuccess<Lesson>>(`/lessons/${id}`, dto).then(unwrap),
};
