import { Navigate, useParams } from 'react-router-dom';
import { Button } from '@/shared/components/Button';
import { Skeleton } from '@/shared/components/Skeleton';
import { useAuthStore } from '@/shared/stores/auth.store';
import { AddModuleForm } from '../components/AddModuleForm';
import { CourseForm } from '../components/CourseForm';
import { ModuleEditorCard } from '../components/ModuleEditorCard';
import { useAddLesson } from '../hooks/useAddLesson';
import { useAddModule } from '../hooks/useAddModule';
import { useCourse } from '../hooks/useCourse';
import { useDeleteCourse } from '../hooks/useDeleteCourse';
import { useUpdateCourse } from '../hooks/useUpdateCourse';

export default function InstructorCourseEditPage() {
  const { id } = useParams<{ id: string }>();
  const currentUser = useAuthStore((s) => s.user);
  const { data: course, isPending, isError } = useCourse(id);
  const updateCourse = useUpdateCourse(id ?? '');
  const deleteCourse = useDeleteCourse();
  const addModule = useAddModule(id ?? '');
  const addLesson = useAddLesson(id ?? '');

  if (isPending) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="mx-auto max-w-lg rounded-card border border-danger-200 bg-danger-50 px-4 py-10 text-center dark:border-danger-500/30 dark:bg-danger-500/10">
        <p className="text-sm font-medium text-danger-700 dark:text-danger-400">
          Could not load this course. It may not exist.
        </p>
      </div>
    );
  }

  if (course.instructorId !== currentUser?.id) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="mx-auto max-w-lg space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Edit course
        </h1>
        <Button
          variant="danger"
          loading={deleteCourse.isPending}
          onClick={() => {
            if (confirm('Delete this course? This cannot be undone.')) {
              deleteCourse.mutate(course.id);
            }
          }}
        >
          Delete
        </Button>
      </div>

      <CourseForm
        mode="edit"
        defaultValues={course}
        isPending={updateCourse.isPending}
        onSubmit={(values) => updateCourse.mutate(values)}
      />

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Modules
        </h2>
        <div className="space-y-4">
          {(course.modules ?? []).map((module) => (
            <ModuleEditorCard
              key={module.id}
              module={module}
              isAddingLesson={addLesson.isPending}
              onAddLesson={(moduleId, values) =>
                addLesson.mutate({ moduleId, dto: values })
              }
            />
          ))}
        </div>
        <div className="mt-4">
          <AddModuleForm
            isPending={addModule.isPending}
            onSubmit={(values) => addModule.mutate(values)}
          />
        </div>
      </div>
    </div>
  );
}
