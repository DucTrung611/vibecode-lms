import type { LearningPath } from '../types/learning-path.types';
import { LearningPathEnrollButton } from './LearningPathEnrollButton';

interface LearningPathCardProps {
  path: LearningPath;
}

export function LearningPathCard({ path }: LearningPathCardProps) {
  return (
    <li className="rounded-card border border-slate-200 bg-surface-0 p-4 shadow-card transition-shadow duration-150 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              {path.title}
            </h2>
            {path.isAiGenerated ? (
              <span className="rounded-pill bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                AI-generated
              </span>
            ) : null}
          </div>
          {path.description ? (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {path.description}
            </p>
          ) : null}
          <ul className="mt-3 flex flex-wrap gap-2">
            {(path.items ?? []).map((item) => (
              <li
                key={item.id}
                className="rounded-pill bg-surface-100 px-2.5 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {item.course?.title ?? 'Untitled course'}
              </li>
            ))}
          </ul>
        </div>
        <LearningPathEnrollButton learningPathId={path.id} />
      </div>
    </li>
  );
}
