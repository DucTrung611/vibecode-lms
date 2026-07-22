import type { Assignment } from '../types/assignment.types';

interface AssignmentDetailsProps {
  assignment: Assignment;
}

export function AssignmentDetails({ assignment }: AssignmentDetailsProps) {
  return (
    <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        {assignment.title}
      </h1>
      <p className="mt-2 whitespace-pre-line text-sm text-slate-600 dark:text-slate-400">
        {assignment.description}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Max score
          </dt>
          <dd className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
            {assignment.maxScore}
          </dd>
        </div>
        {assignment.dueDate ? (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Due date
            </dt>
            <dd className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
              {new Date(assignment.dueDate).toLocaleDateString()}
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
