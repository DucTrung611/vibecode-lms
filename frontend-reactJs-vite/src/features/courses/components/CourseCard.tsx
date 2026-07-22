import { Link } from 'react-router-dom';
import type { Course } from '../types/courses.types';
import { LevelBadge } from './CourseBadges';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="group flex flex-col overflow-hidden rounded-card border border-surface-200 bg-surface-0 shadow-card transition-shadow duration-150 hover:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="aspect-video w-full overflow-hidden bg-surface-100 dark:bg-slate-800">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-150 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400 dark:text-slate-500">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <LevelBadge level={course.level} />
        <h3 className="line-clamp-2 font-semibold text-slate-900 dark:text-slate-100">
          {course.title}
        </h3>
        <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
          {course.description}
        </p>
        <span
          className={`mt-auto text-sm font-semibold ${course.price === 0 ? 'text-success-600 dark:text-success-500' : 'text-slate-900 dark:text-slate-100'}`}
        >
          {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
        </span>
      </div>
    </Link>
  );
}
