import { Link } from 'react-router-dom';
import { Skeleton } from '@/shared/components/Skeleton';
import { useMyEnrollments } from '../hooks/useMyEnrollments';

export default function MyEnrollmentsPage() {
  const { data, isPending, isError } = useMyEnrollments();

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <h1 className="text-2xl font-semibold text-gray-900">My courses</h1>

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-red-600">Could not load your enrollments.</p>
      ) : data && data.items.length > 0 ? (
        <ul className="space-y-3">
          {data.items.map((enrollment) => (
            <li
              key={enrollment.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
            >
              <div>
                <Link
                  to={`/courses/${enrollment.courseId}`}
                  className="font-medium text-gray-900 hover:underline"
                >
                  {enrollment.course?.title ?? 'Untitled course'}
                </Link>
                <p className="text-sm text-gray-500">
                  Enrolled{' '}
                  {new Date(enrollment.enrolledAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={
                  enrollment.status === 'COMPLETED'
                    ? 'rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700'
                    : 'rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700'
                }
              >
                {enrollment.status}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">
          You haven't enrolled in any courses yet.{' '}
          <Link to="/courses" className="text-purple-600 hover:underline">
            Browse courses
          </Link>
          .
        </p>
      )}
    </div>
  );
}
