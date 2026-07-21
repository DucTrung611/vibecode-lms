import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/get-error-message';
import { assignmentService } from '../services/assignment.service';
import type { CreateSubmissionPayload } from '../types/assignment.types';

export function useSubmitAssignment(assignmentId: string) {
  return useMutation({
    mutationFn: (payload: CreateSubmissionPayload) =>
      assignmentService.submit(assignmentId, payload),
    onSuccess: () => {
      toast.success('Assignment submitted');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not submit your assignment'));
    },
  });
}
