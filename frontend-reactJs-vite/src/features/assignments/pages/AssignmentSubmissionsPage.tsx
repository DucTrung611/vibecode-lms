import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Pagination } from '@/shared/components/Pagination';
import { Skeleton } from '@/shared/components/Skeleton';
import { useAssignmentSubmissions } from '../hooks/useAssignmentSubmissions';

export default function AssignmentSubmissionsPage() {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState(1);
  const { data, isPending, isError } = useAssignmentSubmissions(id, page);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <h1 className="text-2xl font-semibold text-gray-900">Submissions</h1>

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-red-600">Could not load submissions.</p>
      ) : data && data.items.length > 0 ? (
        <>
          <ul className="space-y-3">
            {data.items.map((submission) => (
              <li
                key={submission.id}
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {submission.student?.fullName ?? 'Unknown student'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(submission.submittedAt).toLocaleDateString()}
                  </span>
                </div>

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

                <div className="mt-3 flex items-center justify-between">
                  {submission.score !== null ? (
                    <span className="text-sm font-medium text-green-700">
                      Graded: {submission.score}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">
                      Not graded yet
                    </span>
                  )}
                  <Link
                    to={`/submissions/${submission.id}/grade`}
                    state={{ submission }}
                    className="text-sm font-medium text-purple-600 hover:underline"
                  >
                    {submission.score !== null ? 'Update grade' : 'Grade'}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      ) : (
        <p className="text-gray-500">No submissions yet.</p>
      )}
    </div>
  );
}
