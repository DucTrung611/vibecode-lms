import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMyEnrollments, useUpdateProgress } from '@/features/enrollment';
import { Skeleton } from '@/shared/components/Skeleton';
import { useAuthStore } from '@/shared/stores/auth.store';
import { LessonContentViewer } from '../components/LessonContentViewer';
import { LessonNav } from '../components/LessonNav';
import { useCourse } from '../hooks/useCourse';
import type { CourseModule, Lesson } from '../types/courses.types';

function flattenLessons(modules: CourseModule[]): Lesson[] {
  return modules
    .slice()
    .sort((a, b) => a.order - b.order)
    .flatMap((courseModule) => courseModule.lessons ?? []);
}

export default function LessonPage() {
  const { courseId, lessonId } = useParams<{
    courseId: string;
    lessonId: string;
  }>();
  const {
    data: course,
    isPending: isCoursePending,
    isError: isCourseError,
  } = useCourse(courseId);
  const currentUser = useAuthStore((s) => s.user);
  const shouldCheckEnrollment = currentUser?.role === 'STUDENT';
  const { data: enrollments, isPending: isEnrollmentsPending } =
    useMyEnrollments(1, 100, shouldCheckEnrollment);

  const enrollment = enrollments?.items.find((e) => e.courseId === courseId);
  const isOwner = Boolean(
    currentUser && course && currentUser.id === course.instructorId,
  );
  const updateProgress = useUpdateProgress(enrollment?.id ?? '');

  const lessons = useMemo(
    () => flattenLessons(course?.modules ?? []),
    [course],
  );
  const currentIndex = lessons.findIndex((l) => l.id === lessonId);
  const lesson = currentIndex >= 0 ? lessons[currentIndex] : undefined;
  const previousLesson = currentIndex > 0 ? lessons[currentIndex - 1] : undefined;
  const nextLesson =
    currentIndex >= 0 && currentIndex < lessons.length - 1
      ? lessons[currentIndex + 1]
      : undefined;

  if (isCoursePending || (shouldCheckEnrollment && isEnrollmentsPending)) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isCourseError || !course || !lesson) {
    return (
      <div className="mx-auto max-w-3xl rounded-card border border-danger-200 bg-danger-50 px-4 py-10 text-center dark:border-danger-500/30 dark:bg-danger-500/10">
        <p className="text-sm font-medium text-danger-700 dark:text-danger-400">
          Could not load this lesson.
        </p>
      </div>
    );
  }

  if (!isOwner && !enrollment) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <p className="text-slate-700 dark:text-slate-300">
          You need to enroll in <strong>{course.title}</strong> to view its
          lessons.
        </p>
        <Link
          to={`/courses/${course.id}`}
          className="font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
        >
          Go to course
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          to={`/courses/${course.id}`}
          className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
        >
          ← {course.title}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {lesson.title}
        </h1>
      </div>

      {isOwner && !enrollment ? (
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          You're previewing this lesson as the course instructor.
        </p>
      ) : null}

      <LessonContentViewer lesson={lesson} />

      <LessonNav
        courseId={course.id}
        previousLesson={previousLesson}
        nextLesson={nextLesson}
        isCompleting={updateProgress.isPending}
        isPreview={isOwner && !enrollment}
        onComplete={() =>
          updateProgress.mutate({ lessonId: lesson.id, status: 'COMPLETED' })
        }
      />
    </div>
  );
}
