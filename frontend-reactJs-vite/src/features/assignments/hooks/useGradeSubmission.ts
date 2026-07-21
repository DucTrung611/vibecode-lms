import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/get-error-message';
import { assignmentService } from '../services/assignment.service';
import type { GradeSubmissionPayload } from '../types/assignment.types';

export function useGradeSubmission(submissionId: string) {
  return useMutation({
    mutationFn: (payload: GradeSubmissionPayload) =>
      assignmentService.gradeSubmission(submissionId, payload),
    onSuccess: () => {
      toast.success('Submission graded');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not save the grade'));
    },
  });
}
