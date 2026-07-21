import { api, unwrap } from '@/shared/services/api';
import type { ApiSuccess } from '@/shared/types/api.types';
import type {
  Assignment,
  AssignmentSubmission,
  CreateSubmissionPayload,
  GradeSubmissionPayload,
} from '../types/assignment.types';

export const assignmentService = {
  getById: (id: string) =>
    api.get<ApiSuccess<Assignment>>(`/assignments/${id}`).then(unwrap),

  listSubmissions: async (assignmentId: string, page: number, limit: number) => {
    const response = await api.get<ApiSuccess<AssignmentSubmission[]>>(
      `/assignments/${assignmentId}/submissions`,
      { params: { page, limit } },
    );
    return { items: response.data.data, meta: response.data.meta! };
  },

  submit: (assignmentId: string, payload: CreateSubmissionPayload) =>
    api
      .post<ApiSuccess<AssignmentSubmission>>(
        `/assignments/${assignmentId}/submissions`,
        payload,
      )
      .then(unwrap),

  gradeSubmission: (submissionId: string, payload: GradeSubmissionPayload) =>
    api
      .patch<ApiSuccess<AssignmentSubmission>>(
        `/submissions/${submissionId}/grade`,
        payload,
      )
      .then(unwrap),
};
