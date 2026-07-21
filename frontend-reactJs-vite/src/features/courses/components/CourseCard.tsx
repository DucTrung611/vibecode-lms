import { Link } from 'react-router-dom';
import type { Course } from '../types/courses.types';

interface CourseCardProps {
  course: Course;
}

const LEVEL_LABELS: Record<Course['level'], string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="flex flex-col overflow-hidden rounded-lg border border-gray-200 transition-shadow hover:shadow-md"
    >
      <div className="aspect-video w-full bg-gray-100">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="w-fit rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
          {LEVEL_LABELS[course.level]}
        </span>
        <h3 className="line-clamp-2 font-semibold text-gray-900">
          {course.title}
        </h3>
        <p className="line-clamp-2 text-sm text-gray-600">
          {course.description}
        </p>
        <span className="mt-auto text-sm font-semibold text-gray-900">
          {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
        </span>
      </div>
    </Link>
  );
}
