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
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Grade submission
      </h1>

      {submission ? (
        <div className="rounded-card border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {submission.student?.fullName ?? 'Unknown student'}
          </p>
          {submission.content ? (
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
              {submission.content}
            </p>
          ) : null}
          {submission.fileUrl ? (
            <a
              href={submission.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
            >
              View submitted file
            </a>
          ) : null}
        </div>
      ) : (
        <p className="rounded-card border border-info-500/30 bg-info-50 p-4 text-sm text-info-700 dark:bg-info-500/10 dark:text-info-500">
          Submission content isn't shown when this page is opened directly —
          open it from the submissions list to see the student's work here.
        </p>
      )}

      {gradeSubmission.isSuccess ? (
        <p className="rounded-card border border-success-500/30 bg-success-50 p-4 text-sm font-medium text-success-700 dark:bg-success-500/10 dark:text-success-500">
          Grade saved.
        </p>
      ) : (
        <GradeForm
          isPending={gradeSubmission.isPending}
          onSubmit={(values) =>
            gradeSubmission.mutate({
              score: values.score,
              feedback: values.feedback || undefined,
            })
          }
        />
      )}
    </div>
  );
}
