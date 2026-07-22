import { Link } from 'react-router-dom';
import type { Course } from '../types/courses.types';
import { LevelBadge } from './CourseBadges';

interface CourseHeroProps {
  course: Course;
  ratingAverage: number;
  ratingCount: number;
}

function HeroStars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 20 20"
          className={`h-4 w-4 ${star <= Math.round(rating) ? 'text-warning-400' : 'text-slate-600'}`}
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 0 0 .95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.447a1 1 0 0 0-.363 1.118l1.286 3.957c.3.922-.755 1.688-1.538 1.118l-3.367-2.447a1 1 0 0 0-1.176 0l-3.367 2.447c-.783.57-1.838-.196-1.538-1.118l1.285-3.957a1 1 0 0 0-.363-1.118L2.063 9.385c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 0 0 .95-.69l1.285-3.958Z" />
        </svg>
      ))}
    </span>
  );
}

export function CourseHero({ course, ratingAverage, ratingCount }: CourseHeroProps) {
  const updatedLabel = new Date(course.updatedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="border-b border-slate-800 bg-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="max-w-2xl">
          <LevelBadge level={course.level} />
          <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
            {course.title}
          </h1>
          <p className="mt-3 text-base text-slate-300">{course.description}</p>

          {course.instructor ? (
            <Link
              to={`/instructors/${course.instructor.id}`}
              className="mt-3 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              {course.instructor.avatarUrl ? (
                <img
                  src={course.instructor.avatarUrl}
                  alt=""
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : null}
              <span>By {course.instructor.fullName}</span>
            </Link>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {ratingCount > 0 ? (
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-warning-400">
                  {ratingAverage.toFixed(1)}
                </span>
                <HeroStars rating={ratingAverage} />
                <span className="text-slate-400">
                  ({ratingCount} rating{ratingCount === 1 ? '' : 's'})
                </span>
              </span>
            ) : (
              <span className="text-slate-400">No ratings yet</span>
            )}
          </div>

          <p className="mt-2 text-xs text-slate-400">
            Last updated {updatedLabel}
          </p>
        </div>
      </div>
    </div>
  );
}
