import type { Assignment } from '../types/assignment.types';

interface AssignmentDetailsProps {
  assignment: Assignment;
}

export function AssignmentDetails({ assignment }: AssignmentDetailsProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-6">
      <h1 className="text-xl font-semibold text-gray-900">{assignment.title}</h1>
      <p className="mt-2 whitespace-pre-line text-gray-600">
        {assignment.description}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
        <div>
          <dt className="text-gray-500">Max score</dt>
          <dd className="font-medium text-gray-900">{assignment.maxScore}</dd>
        </div>
        {assignment.dueDate ? (
          <div>
            <dt className="text-gray-500">Due date</dt>
            <dd className="font-medium text-gray-900">
              {new Date(assignment.dueDate).toLocaleDateString()}
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
