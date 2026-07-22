import { CourseCard } from '@/features/courses';
import { Pagination } from '@/shared/components/Pagination';
import { useInstructorCourses } from '../hooks/useInstructorCourses';

interface InstructorCourseGridProps {
  instructorId: string;
  page: number;
  onPageChange: (page: number) => void;
}

export function InstructorCourseGrid({
  instructorId,
  page,
  onPageChange,
}: InstructorCourseGridProps) {
  const { data, isPending, isError } = useInstructorCourses(instructorId, page);

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-card bg-surface-100 dark:bg-slate-800"
          />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-card border border-danger-200 bg-danger-50 px-4 py-10 text-center dark:border-danger-500/30 dark:bg-danger-500/10">
        <p className="text-sm font-medium text-danger-700 dark:text-danger-400">
          Could not load this instructor&apos;s courses.
        </p>
      </div>
    );
  }

  if (data.items.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-surface-200 px-4 py-16 text-center dark:border-slate-700">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          This instructor hasn&apos;t published any courses yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
      <Pagination meta={data.meta} onPageChange={onPageChange} />
    </div>
  );
}
