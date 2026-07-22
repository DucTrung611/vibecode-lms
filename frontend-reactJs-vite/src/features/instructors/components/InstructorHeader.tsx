import { StatCard } from '@/shared/components/StatCard';
import type { InstructorProfile } from '../types/instructors.types';

interface InstructorHeaderProps {
  profile: InstructorProfile;
}

function InitialsAvatar({ fullName }: { fullName: string }) {
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-xl font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
      {initials || '?'}
    </div>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 20 20"
          className={`h-4 w-4 ${star <= Math.round(rating) ? 'text-warning-400' : 'text-slate-300 dark:text-slate-600'}`}
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 0 0 .95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.447a1 1 0 0 0-.363 1.118l1.286 3.957c.3.922-.755 1.688-1.538 1.118l-3.367-2.447a1 1 0 0 0-1.176 0l-3.367 2.447c-.783.57-1.838-.196-1.538-1.118l1.285-3.957a1 1 0 0 0-.363-1.118L2.063 9.385c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 0 0 .95-.69l1.285-3.958Z" />
        </svg>
      ))}
    </span>
  );
}

export function InstructorHeader({ profile }: InstructorHeaderProps) {
  const { stats } = profile;
  const ratingValue =
    stats.averageRating !== null ? `${stats.averageRating.toFixed(1)} ★` : '—';
  const ratingSubLabel =
    stats.reviewCount > 0
      ? `${stats.reviewCount} review${stats.reviewCount === 1 ? '' : 's'}`
      : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt=""
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <InitialsAvatar fullName={profile.fullName} />
        )}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {profile.fullName}
          </h1>
          {stats.averageRating !== null ? (
            <div className="mt-1 flex items-center gap-1.5">
              <RatingStars rating={stats.averageRating} />
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {ratingValue} ({stats.reviewCount})
              </span>
            </div>
          ) : null}
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            {profile.bio ?? 'This instructor has not shared a bio yet.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Courses" value={String(stats.totalCourses)} />
        <StatCard label="Students" value={String(stats.totalStudents)} />
        <StatCard label="Rating" value={ratingValue} subLabel={ratingSubLabel} />
      </div>
    </div>
  );
}
