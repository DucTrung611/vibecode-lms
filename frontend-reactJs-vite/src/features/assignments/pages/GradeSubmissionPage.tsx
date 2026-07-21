import { useParams } from 'react-router-dom';
import { GradeForm } from '../components/GradeForm';
import { useGradeSubmission } from '../hooks/useGradeSubmission';

export default function GradeSubmissionPage() {
  const { id } = useParams<{ id: string }>();
  const gradeSubmission = useGradeSubmission(id ?? '');

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-xl font-semibold text-gray-900">Grade submission</h1>
      <p className="mt-2 text-sm text-gray-500">
        Submission content isn't viewable here yet — see the assignments
        feature's `context.md` for why. Enter the score and feedback once
        you've reviewed the work elsewhere.
      </p>

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
