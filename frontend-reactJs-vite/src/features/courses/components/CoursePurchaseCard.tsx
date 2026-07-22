import { Link } from 'react-router-dom';
import { EnrollButton } from '@/features/enrollment';
import type { Course } from '../types/courses.types';

interface CoursePurchaseCardProps {
  course: Course;
  isOwner: boolean;
}

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes}m total length`;
  return `${hours}h ${minutes}m total length`;
}

export function CoursePurchaseCard({ course, isOwner }: CoursePurchaseCardProps) {
  const lessons = (course.modules ?? []).flatMap((module) => module.lessons ?? []);
  const moduleCount = course.modules?.length ?? 0;
  const totalDurationSec = lessons.reduce(
    (sum, lesson) => sum + (lesson.durationSec ?? 0),
    0,
  );
  const typeCounts = {
    VIDEO: lessons.filter((l) => l.type === 'VIDEO').length,
    TEXT: lessons.filter((l) => l.type === 'TEXT').length,
    QUIZ: lessons.filter((l) => l.type === 'QUIZ').length,
    ASSIGNMENT: lessons.filter((l) => l.type === 'ASSIGNMENT').length,
  };

  const includes = [
    lessons.length > 0 &&
      `${lessons.length} lesson${lessons.length === 1 ? '' : 's'} across ${moduleCount} module${moduleCount === 1 ? '' : 's'}`,
    totalDurationSec > 0 && formatDuration(totalDurationSec),
    typeCounts.QUIZ > 0 && `${typeCounts.QUIZ} quiz${typeCounts.QUIZ === 1 ? '' : 'zes'}`,
    typeCounts.ASSIGNMENT > 0 &&
      `${typeCounts.ASSIGNMENT} assignment${typeCounts.ASSIGNMENT === 1 ? '' : 's'}`,
    'Full lifetime access',
    'Certificate of completion',
  ].filter((item): item is string => Boolean(item));

  return (
    <div className="overflow-hidden rounded-card border border-slate-200 bg-white shadow-popover dark:border-slate-800 dark:bg-slate-900">
      <div className="aspect-video w-full overflow-hidden bg-surface-100 dark:bg-slate-800">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400 dark:text-slate-500">
            No preview available
          </div>
        )}
      </div>

      <div className="space-y-4 p-5">
        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
        </p>

        <div className="flex justify-center [&>button]:w-full">
          {isOwner ? (
            <Link
              to={`/instructor/courses/${course.id}/edit`}
              className="flex w-full items-center justify-center rounded-control border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-surface-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Edit course
            </Link>
          ) : (
            <EnrollButton courseId={course.id} price={course.price} />
          )}
        </div>

        {includes.length > 0 ? (
          <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              This course includes:
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
              {includes.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 5.29a1 1 0 010 1.415l-7.5 7.5a1 1 0 01-1.415 0l-3.5-3.5a1 1 0 111.415-1.415L8.5 12.086l6.79-6.796a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
