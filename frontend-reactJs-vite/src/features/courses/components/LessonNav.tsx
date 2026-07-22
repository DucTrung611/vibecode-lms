import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/Button';
import type { Lesson } from '../types/courses.types';

interface LessonNavProps {
  courseId: string;
  previousLesson?: Lesson;
  nextLesson?: Lesson;
  onComplete: () => void;
  isCompleting: boolean;
  isPreview?: boolean;
}

const NAV_LINK_CLASSES =
  'rounded-control text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 dark:text-brand-400 dark:hover:text-brand-300';

export function LessonNav({
  courseId,
  previousLesson,
  nextLesson,
  onComplete,
  isCompleting,
  isPreview = false,
}: LessonNavProps) {
  return (
    <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:justify-between">
      {previousLesson ? (
        <Link
          to={`/courses/${courseId}/lessons/${previousLesson.id}`}
          className={NAV_LINK_CLASSES}
        >
          ← {previousLesson.title}
        </Link>
      ) : (
        <span />
      )}

      {isPreview ? (
        <span className="rounded-pill bg-surface-100 px-3 py-1.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          Preview mode
        </span>
      ) : (
        <Button onClick={onComplete} loading={isCompleting}>
          Mark as complete
        </Button>
      )}

      {nextLesson ? (
        <Link
          to={`/courses/${courseId}/lessons/${nextLesson.id}`}
          className={NAV_LINK_CLASSES}
        >
          {nextLesson.title} →
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
