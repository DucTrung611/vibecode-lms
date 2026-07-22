import { Link } from 'react-router-dom';
import type { CourseAnalyticsSummary } from '../types/analytics.types';

interface CourseAnalyticsTableProps {
  courses: CourseAnalyticsSummary[];
}

export function CourseAnalyticsTable({ courses }: CourseAnalyticsTableProps) {
  return (
    <div className="overflow-x-auto rounded-card border border-slate-200 shadow-card dark:border-slate-800">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
        <thead className="bg-surface-50 dark:bg-slate-900">
          <tr>
            <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Course</th>
            <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Students</th>
            <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Completion</th>
            <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Revenue</th>
            <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Rating</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950">
          {courses.map((course) => (
            <tr key={course.id} className="transition-colors hover:bg-surface-50 dark:hover:bg-slate-900">
              <td className="px-4 py-3">
                <Link
                  to={`/instructor/courses/${course.id}/analytics`}
                  className="font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
                >
                  {course.title}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{course.enrolledCount}</td>
              <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                {Math.round(course.completionRate * 100)}%
              </td>
              <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                ${course.revenue.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                {course.averageRating !== null ? `${course.averageRating.toFixed(1)} ★` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
