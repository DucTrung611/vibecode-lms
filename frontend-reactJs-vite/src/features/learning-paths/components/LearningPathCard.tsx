import type { LearningPath } from '../types/learning-path.types';
import { LearningPathEnrollButton } from './LearningPathEnrollButton';

interface LearningPathCardProps {
  path: LearningPath;
}

export function LearningPathCard({ path }: LearningPathCardProps) {
  return (
    <li className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-900">{path.title}</h2>
            {path.isAiGenerated ? (
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                AI-generated
              </span>
            ) : null}
          </div>
          {path.description ? (
            <p className="mt-1 text-sm text-gray-600">{path.description}</p>
          ) : null}
          <ul className="mt-2 flex flex-wrap gap-2">
            {(path.items ?? []).map((item) => (
              <li
                key={item.id}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
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
