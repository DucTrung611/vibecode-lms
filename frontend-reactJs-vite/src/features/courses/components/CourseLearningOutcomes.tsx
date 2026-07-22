import type { CourseModule } from '../types/courses.types';

interface CourseLearningOutcomesProps {
  modules: CourseModule[];
}

export function CourseLearningOutcomes({ modules }: CourseLearningOutcomesProps) {
  const lessonTitles = modules.flatMap((module) =>
    (module.lessons ?? []).map((lesson) => lesson.title),
  );
  const outcomes = Array.from(new Set(lessonTitles)).slice(0, 8);

  if (outcomes.length < 2) return null;

  return (
    <div className="rounded-card border border-slate-200 p-5 dark:border-slate-800">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        What you&apos;ll learn
      </h2>
      <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        {outcomes.map((title) => (
          <li
            key={title}
            className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
          >
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-success-600 dark:text-success-500"
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
            {title}
          </li>
        ))}
      </ul>
    </div>
  );
}
