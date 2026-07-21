import { Link } from 'react-router-dom';
import type { CourseModule, LessonFormValues } from '../types/courses.types';
import { AddLessonForm } from './AddLessonForm';

interface ModuleEditorCardProps {
  module: CourseModule;
  isAddingLesson: boolean;
  onAddLesson: (moduleId: string, values: LessonFormValues) => void;
}

export function ModuleEditorCard({
  module,
  isAddingLesson,
  onAddLesson,
}: ModuleEditorCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900">{module.title}</h3>

      {module.lessons && module.lessons.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {module.lessons.map((lesson) => (
            <li key={lesson.id} className="text-sm text-gray-700">
              {lesson.title}{' '}
              <span className="text-xs text-gray-500">({lesson.type})</span>
              {lesson.assignmentId ? (
                <Link
                  to={`/assignments/${lesson.assignmentId}/submissions`}
                  className="ml-2 text-xs font-medium text-purple-600 hover:underline"
                >
                  View submissions
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-gray-500">No lessons yet.</p>
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
