import { Link } from 'react-router-dom';
import type { CourseModule } from '../types/courses.types';

interface CourseModuleListProps {
  courseId: string;
  modules: CourseModule[];
}

const LESSON_TYPE_LABELS: Record<string, string> = {
  VIDEO: 'Video',
  TEXT: 'Reading',
  QUIZ: 'Quiz',
  ASSIGNMENT: 'Assignment',
};

export function CourseModuleList({ courseId, modules }: CourseModuleListProps) {
  if (modules.length === 0) {
    return <p className="text-sm text-gray-500">No modules yet.</p>;
  }

  return (
    <div className="space-y-4">
      {modules.map((module) => (
        <div key={module.id} className="rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900">{module.title}</h3>
          {module.lessons && module.lessons.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {module.lessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className="flex items-center justify-between text-sm text-gray-700"
                >
                  <Link
                    to={`/courses/${courseId}/lessons/${lesson.id}`}
                    className="hover:text-purple-600 hover:underline"
                  >
                    {lesson.title}
                  </Link>
                  <span className="flex items-center gap-2">
                    {lesson.quizId ? (
                      <Link
                        to={`/quizzes/${lesson.quizId}/attempt`}
                        className="text-xs font-medium text-purple-600 hover:underline"
                      >
                        Take quiz
                      </Link>
                    ) : null}
                    {lesson.assignmentId ? (
                      <Link
                        to={`/assignments/${lesson.assignmentId}/submit`}
                        className="text-xs font-medium text-purple-600 hover:underline"
                      >
                        View assignment
                      </Link>
                    ) : null}
                    <span className="text-xs text-gray-500">
                      {LESSON_TYPE_LABELS[lesson.type]}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-gray-500">No lessons yet.</p>
          )}
        </div>
      ))}
    </div>
  );
}
