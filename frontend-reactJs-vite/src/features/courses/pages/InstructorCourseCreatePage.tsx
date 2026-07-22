import { Link } from 'react-router-dom';
import { CourseForm } from '../components/CourseForm';
import { useCreateCourse } from '../hooks/useCreateCourse';

export default function InstructorCourseCreatePage() {
  const createCourse = useCreateCourse();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to="/courses"
        className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
      >
        ← Courses
      </Link>

      <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Create a course
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Fill in the basics to get started — you can add modules and lessons
        right after creating it.
      </p>

      <div className="mt-6 rounded-card border border-surface-200 bg-surface-0 p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <CourseForm
          mode="create"
          isPending={createCourse.isPending}
          onSubmit={(values) => createCourse.mutate(values)}
        />
      </div>
    </div>
  );
}
