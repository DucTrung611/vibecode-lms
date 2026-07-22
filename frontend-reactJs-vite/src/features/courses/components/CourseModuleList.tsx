import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { CourseModule } from '../types/courses.types';
import { LessonTypeBadge } from './CourseBadges';

interface CourseModuleListProps {
  courseId: string;
  modules: CourseModule[];
}

function ModuleAccordionItem({
  courseId,
  module,
}: {
  courseId: string;
  module: CourseModule;
}) {
  const [open, setOpen] = useState(true);
  const lessons = module.lessons ?? [];

  return (
    <div className="overflow-hidden rounded-card border border-surface-200 bg-surface-0 dark:border-slate-800 dark:bg-slate-900">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-50 dark:hover:bg-slate-800"
      >
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {module.title}
        </span>
        <span className="flex shrink-0 items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>
            {lessons.length} lesson{lessons.length === 1 ? '' : 's'}
          </span>
          <svg
            className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>
      {open ? (
        lessons.length > 0 ? (
          <ul className="divide-y divide-surface-100 border-t border-surface-200 dark:divide-slate-800 dark:border-slate-800">
            {lessons.map((lesson) => (
              <li
                key={lesson.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm text-slate-700 dark:text-slate-300"
              >
                <Link
                  to={`/courses/${courseId}/lessons/${lesson.id}`}
                  className="rounded-control font-medium text-slate-700 transition-colors hover:text-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
                >
                  {lesson.title}
                </Link>
                <span className="flex items-center gap-3">
                  {lesson.quizId ? (
                    <Link
                      to={`/quizzes/${lesson.quizId}/attempt`}
                      className="text-xs font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
                    >
                      Take quiz
                    </Link>
                  ) : null}
                  {lesson.assignmentId ? (
                    <Link
                      to={`/assignments/${lesson.assignmentId}/submit`}
                      className="text-xs font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
                    >
                      View assignment
                    </Link>
                  ) : null}
                  <LessonTypeBadge type={lesson.type} />
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="border-t border-surface-200 px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
            No lessons yet.
          </p>
        )
      ) : null}
    </div>
  );
}

export function CourseModuleList({ courseId, modules }: CourseModuleListProps) {
  if (modules.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-surface-200 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        No modules yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {modules.map((module) => (
        <ModuleAccordionItem key={module.id} courseId={courseId} module={module} />
      ))}
    </div>
  );
}
