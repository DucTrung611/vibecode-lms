import { useLocation, useParams } from 'react-router-dom';
import { GradeForm } from '../components/GradeForm';
import { useGradeSubmission } from '../hooks/useGradeSubmission';
import type { AssignmentSubmission } from '../types/assignment.types';

export default function GradeSubmissionPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const submission = (
    location.state as { submission?: AssignmentSubmission } | null
  )?.submission;
  const gradeSubmission = useGradeSubmission(id ?? '');

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-xl font-semibold text-gray-900">Grade submission</h1>

      {submission ? (
        <div className="mt-4 rounded-lg border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-900">
            {submission.student?.fullName ?? 'Unknown student'}
          </p>
          {submission.content ? (
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
              {submission.content}
            </p>
          ) : null}
          {submission.fileUrl ? (
            <a
              href={submission.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm text-purple-600 hover:underline"
            >
              View submitted file
            </a>
          ) : null}
        </div>
      ) : (
        <p className="mt-2 text-sm text-gray-500">
          Submission content isn't shown when this page is opened directly —
          open it from the submissions list to see the student's work here.
        </p>
      )}

      {gradeSubmission.isSuccess ? (
        <p className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
          Grade saved.
        </p>
      ) : (
        <div className="mt-6">
          <GradeForm
            isPending={gradeSubmission.isPending}
            onSubmit={(values) =>
              gradeSubmission.mutate({
                score: values.score,
                feedback: values.feedback || undefined,
              })
            }
          />
        </div>
      )}
    </div>
  );
}
