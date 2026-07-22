import { Link, useParams } from 'react-router-dom';
import { CourseReviews, useCourseReviews } from '@/features/reviews';
import { Skeleton } from '@/shared/components/Skeleton';
import { useAuthStore } from '@/shared/stores/auth.store';
import { CourseHero } from '../components/CourseHero';
import { CourseLearningOutcomes } from '../components/CourseLearningOutcomes';
import { CourseModuleList } from '../components/CourseModuleList';
import { CoursePurchaseCard } from '../components/CoursePurchaseCard';
import { useCourse } from '../hooks/useCourse';
import type { CourseLevel } from '../types/courses.types';

const LEVEL_REQUIREMENT: Record<CourseLevel, string> = {
  BEGINNER:
    'No prior experience needed — just curiosity and a willingness to learn.',
  INTERMEDIATE:
    'A basic understanding of the topic is recommended before starting.',
  ADVANCED: 'Solid foundational knowledge of the subject is expected.',
};

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: course, isPending, isError } = useCourse(id);
  const reviews = useCourseReviews(id ?? '', 1, 50);
  const currentUser = useAuthStore((s) => s.user);

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="mx-auto max-w-3xl rounded-card border border-danger-200 bg-danger-50 px-4 py-10 text-center dark:border-danger-500/30 dark:bg-danger-500/10">
        <p className="text-sm font-medium text-danger-700 dark:text-danger-400">
          Could not load this course. It may not exist.
        </p>
      </div>
    );
  }

  const isOwner = currentUser?.id === course.instructorId;
  const reviewItems = reviews.data?.items ?? [];
  const ratingCount = reviews.data?.meta.total ?? 0;
  const ratingAverage =
    reviewItems.length > 0
      ? reviewItems.reduce((sum, r) => sum + r.rating, 0) / reviewItems.length
      : 0;

  return (
    <div>
      <div className="-mx-4 -mt-6 sm:-mx-6 sm:-mt-8">
        <CourseHero
          course={course}
          ratingAverage={ratingAverage}
          ratingCount={ratingCount}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <CourseLearningOutcomes modules={course.modules ?? []} />

          <div className="rounded-card border border-slate-200 p-5 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Requirements
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {LEVEL_REQUIREMENT[course.level]}
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Course content
            </h2>
            <CourseModuleList courseId={course.id} modules={course.modules ?? []} />
          </div>

          {currentUser?.role === 'STUDENT' ? (
            <Link
              to={`/chat?courseId=${course.id}`}
              className="inline-block rounded-control text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
            >
              Ask the AI assistant about this course
            </Link>
          ) : null}

          <CourseReviews courseId={course.id} />
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-20">
            <CoursePurchaseCard course={course} isOwner={isOwner} />
          </div>
        </div>
      </div>
    </div>
  );
}
