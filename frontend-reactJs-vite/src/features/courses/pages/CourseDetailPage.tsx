import { Link, useParams } from 'react-router-dom';
import { EnrollButton } from '@/features/enrollment';
import { CourseReviews } from '@/features/reviews';
import { Skeleton } from '@/shared/components/Skeleton';
import { useAuthStore } from '@/shared/stores/auth.store';
import { CourseModuleList } from '../components/CourseModuleList';
import { useCourse } from '../hooks/useCourse';

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: course, isPending, isError } = useCourse(id);
  const currentUser = useAuthStore((s) => s.user);

  if (isPending) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-12">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-center text-red-600">
          Could not load this course. It may not exist.
        </p>
      </div>
    );
  }

  const isOwner = currentUser?.id === course.instructorId;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {course.title}
          </h1>
          <p className="mt-2 text-gray-600">{course.description}</p>
        </div>
        {isOwner ? (
          <Link
            to={`/instructor/courses/${course.id}/edit`}
            className="whitespace-nowrap text-sm font-medium text-purple-600 hover:underline"
          >
            Edit course
          </Link>
        ) : (
          <EnrollButton courseId={course.id} price={course.price} />
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span>{course.level}</span>
        <span>·</span>
        <span>{course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}</span>
        <span>·</span>
        <span>{course.status}</span>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Content</h2>
        <CourseModuleList modules={course.modules ?? []} />
      </div>

      {currentUser?.role === 'STUDENT' ? (
        <Link
          to={`/chat?courseId=${course.id}`}
          className="inline-block text-sm font-medium text-purple-600 hover:underline"
        >
          Ask the AI assistant about this course
        </Link>
      ) : null}

      <CourseReviews courseId={course.id} />
    </div>
  );
}
