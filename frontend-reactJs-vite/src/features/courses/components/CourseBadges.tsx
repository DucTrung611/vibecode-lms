import type { Course, LessonType } from '../types/courses.types';

const LEVEL_LABELS: Record<Course['level'], string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

const LEVEL_CLASSES: Record<Course['level'], string> = {
  BEGINNER: 'bg-info-50 text-info-700 dark:bg-info-500/10 dark:text-info-400',
  INTERMEDIATE:
    'bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-500',
  ADVANCED:
    'bg-danger-50 text-danger-700 dark:bg-danger-500/10 dark:text-danger-400',
};

export function LevelBadge({ level }: { level: Course['level'] }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-pill px-2.5 py-0.5 text-xs font-medium ${LEVEL_CLASSES[level]}`}
    >
      {LEVEL_LABELS[level]}
    </span>
  );
}

const STATUS_LABELS: Record<Course['status'], string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
};

const STATUS_CLASSES: Record<Course['status'], string> = {
  DRAFT:
    'bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-500',
  PUBLISHED:
    'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-500',
  ARCHIVED: 'bg-surface-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

export function StatusBadge({ status }: { status: Course['status'] }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-pill px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  VIDEO: 'Video',
  TEXT: 'Reading',
  QUIZ: 'Quiz',
  ASSIGNMENT: 'Assignment',
};

export function LessonTypeBadge({ type }: { type: LessonType }) {
  return (
    <span className="inline-flex w-fit items-center rounded-pill bg-surface-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
      {LESSON_TYPE_LABELS[type]}
    </span>
  );
}
