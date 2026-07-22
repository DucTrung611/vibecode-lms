import { CourseForm } from '../components/CourseForm';
import { useCreateCourse } from '../hooks/useCreateCourse';

export default function InstructorCourseCreatePage() {
  const createCourse = useCreateCourse();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Create a course
      </h1>
      <CourseForm
        mode="create"
        isPending={createCourse.isPending}
        onSubmit={(values) => createCourse.mutate(values)}
      />
    </div>
  );
}
