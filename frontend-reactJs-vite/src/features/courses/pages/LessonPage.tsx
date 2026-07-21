import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMyEnrollments, useUpdateProgress } from '@/features/enrollment';
import { Button } from '@/shared/components/Button';
import { Skeleton } from '@/shared/components/Skeleton';
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
  const { data: enrollments, isPending: isEnrollmentsPending } =
    useMyEnrollments();

  const enrollment = enrollments?.items.find((e) => e.courseId === courseId);
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

  if (isCoursePending || isEnrollmentsPending) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-12">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isCourseError || !course || !lesson) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-center text-red-600">Could not load this lesson.</p>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-12">
        <p className="text-gray-700">
          You need to enroll in <strong>{course.title}</strong> to view its
          lessons.
        </p>
        <Link
          to={`/courses/${course.id}`}
          className="text-purple-600 hover:underline"
        >
          Go to course
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <div>
        <Link
          to={`/courses/${course.id}`}
          className="text-sm text-purple-600 hover:underline"
        >
          ← {course.title}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">
          {lesson.title}
        </h1>
      </div>

      <div className="rounded-lg border border-gray-200 p-4">
        {lesson.type === 'VIDEO' && lesson.videoUrl ? (
          <video src={lesson.videoUrl} controls className="w-full rounded-md" />
        ) : lesson.type === 'TEXT' && lesson.content ? (
          <p className="whitespace-pre-wrap text-gray-700">{lesson.content}</p>
        ) : lesson.quizId ? (
          <p className="text-gray-700">
            This lesson has a quiz.{' '}
            <Link
              to={`/quizzes/${lesson.quizId}/attempt`}
              className="text-purple-600 hover:underline"
            >
              Take the quiz
            </Link>
          </p>
        ) : lesson.assignmentId ? (
          <p className="text-gray-700">
            This lesson has an assignment.{' '}
            <Link
              to={`/assignments/${lesson.assignmentId}/submit`}
              className="text-purple-600 hover:underline"
            >
              View the assignment
            </Link>
          </p>
        ) : (
          <p className="text-gray-500">No content for this lesson yet.</p>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        {previousLesson ? (
          <Link
            to={`/courses/${course.id}/lessons/${previousLesson.id}`}
            className="text-sm font-medium text-purple-600 hover:underline"
          >
            ← {previousLesson.title}
          </Link>
        ) : (
          <span />
        )}

        <Button
          onClick={() =>
            updateProgress.mutate({ lessonId: lesson.id, status: 'COMPLETED' })
          }
          disabled={updateProgress.isPending}
        >
          {updateProgress.isPending ? 'Saving…' : 'Mark as complete'}
        </Button>

        {nextLesson ? (
          <Link
            to={`/courses/${course.id}/lessons/${nextLesson.id}`}
            className="text-sm font-medium text-purple-600 hover:underline"
          >
            {nextLesson.title} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
