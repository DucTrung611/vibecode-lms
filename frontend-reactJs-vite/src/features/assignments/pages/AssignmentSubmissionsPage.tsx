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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Submissions
      </h1>

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-card" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-card border border-danger-500/30 bg-danger-50 p-4 text-sm font-medium text-danger-700 dark:bg-danger-500/10 dark:text-danger-500">
          Could not load submissions.
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          <ul className="space-y-3">
            {data.items.map((submission) => (
              <li
                key={submission.id}
                className="rounded-card border border-slate-200 bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {submission.student?.fullName ?? 'Unknown student'}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(submission.submittedAt).toLocaleDateString()}
                  </span>
                </div>

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

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  {submission.score !== null ? (
                    <span className="inline-flex items-center rounded-pill bg-success-50 px-2.5 py-1 text-xs font-semibold text-success-700 dark:bg-success-500/10 dark:text-success-500">
                      Graded: {submission.score}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-pill bg-warning-50 px-2.5 py-1 text-xs font-semibold text-warning-700 dark:bg-warning-500/10 dark:text-warning-500">
                      Not graded yet
                    </span>
                  )}
                  <Link
                    to={`/submissions/${submission.id}/grade`}
                    state={{ submission }}
                    className="rounded-control text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
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
        <div className="rounded-card border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            No submissions yet
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Submissions will appear here once students turn in their work.
          </p>
        </div>
      )}
    </div>
  );
}
