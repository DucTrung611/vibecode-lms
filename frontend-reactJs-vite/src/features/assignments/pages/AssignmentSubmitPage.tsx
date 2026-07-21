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
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-12">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !assignment) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-center text-red-600">
          Could not load this assignment.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <AssignmentDetails assignment={assignment} />

      {submitAssignment.isSuccess ? (
        <p className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
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
