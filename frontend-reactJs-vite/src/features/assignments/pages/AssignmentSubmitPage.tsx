import { useParams } from 'react-router-dom';
import { Skeleton } from '@/shared/components/Skeleton';
import { AssignmentDetails } from '../components/AssignmentDetails';
import { SubmissionForm } from '../components/SubmissionForm';
import { useAssignment } from '../hooks/useAssignment';
import { useSubmitAssignment } from '../hooks/useSubmitAssignment';

export default function AssignmentSubmitPage() {
  const { id } = useParams<{ id: string }>();
  const { data: assignment, isPending, isError } = useAssignment(id);
  const submitAssignment = useSubmitAssignment(id ?? '');

  if (isPending) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !assignment) {
    return (
      <div className="mx-auto max-w-2xl rounded-card border border-danger-500/30 bg-danger-50 p-6 text-center dark:bg-danger-500/10">
        <p className="text-sm font-medium text-danger-700 dark:text-danger-500">
          Could not load this assignment.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <AssignmentDetails assignment={assignment} />

      {submitAssignment.isSuccess ? (
        <p className="mt-6 rounded-card border border-success-500/30 bg-success-50 p-4 text-sm font-medium text-success-700 dark:bg-success-500/10 dark:text-success-500">
          Your submission has been received.
        </p>
      ) : (
        <SubmissionForm
          isPending={submitAssignment.isPending}
          onSubmit={(values) =>
            submitAssignment.mutate({
              fileUrl: values.fileUrl || undefined,
              content: values.content || undefined,
            })
          }
        />
      )}
    </div>
  );
}
