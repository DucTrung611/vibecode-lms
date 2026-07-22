import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/Button';
import type { CourseModule, LessonFormValues } from '../types/courses.types';
import { AddLessonForm } from './AddLessonForm';
import { LessonTypeBadge } from './CourseBadges';
import { EditLessonForm } from './EditLessonForm';

interface ModuleEditorCardProps {
  module: CourseModule;
  isAddingLesson: boolean;
  onAddLesson: (moduleId: string, values: LessonFormValues) => void;
  isUpdatingLesson: boolean;
  onUpdateLesson: (lessonId: string, values: LessonFormValues) => void;
}

export function ModuleEditorCard({
  module,
  isAddingLesson,
  onAddLesson,
  isUpdatingLesson,
  onUpdateLesson,
}: ModuleEditorCardProps) {
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  return (
    <div className="rounded-card border border-surface-200 bg-surface-0 p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
        {module.title}
      </h3>

      {module.lessons && module.lessons.length > 0 ? (
        <ul className="mt-2 divide-y divide-surface-100 dark:divide-slate-800">
          {module.lessons.map((lesson) =>
            editingLessonId === lesson.id ? (
              <li key={lesson.id} className="py-2">
                <EditLessonForm
                  lesson={lesson}
                  isPending={isUpdatingLesson}
                  onSubmit={(values) => {
                    onUpdateLesson(lesson.id, values);
                    setEditingLessonId(null);
                  }}
                  onCancel={() => setEditingLessonId(null)}
                />
              </li>
            ) : (
              <li
                key={lesson.id}
                className="flex flex-wrap items-center gap-2 py-2 text-sm text-slate-700 dark:text-slate-300"
              >
                <span>{lesson.title}</span>
                <LessonTypeBadge type={lesson.type} />
                {lesson.assignmentId ? (
                  <Link
                    to={`/assignments/${lesson.assignmentId}/submissions`}
                    className="text-xs font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
                  >
                    View submissions
                  </Link>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => setEditingLessonId(lesson.id)}
                >
                  Edit
                </Button>
              </li>
            ),
          )}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          No lessons yet.
        </p>
      )}

      <div className="mt-3">
        <AddLessonForm
          isPending={isAddingLesson}
          onSubmit={(values) => onAddLesson(module.id, values)}
        />
      </div>
    </div>
  );
}
