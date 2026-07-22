import { useState } from 'react';
import { Button } from '@/shared/components/Button';
import { Pagination } from '@/shared/components/Pagination';
import { CourseCard } from '../components/CourseCard';
import { CourseCardSkeleton } from '../components/CourseCardSkeleton';
import { CourseFilters } from '../components/CourseFilters';
import { useCourses } from '../hooks/useCourses';
import type { CourseLevel } from '../types/courses.types';

export default function CourseCatalogPage() {
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState<CourseLevel | ''>('');
  const [categoryId, setCategoryId] = useState('');

  const hasActiveFilters = level !== '' || categoryId !== '';

  const { data, isPending, isError } = useCourses({
    page,
    limit: 12,
    status: 'PUBLISHED',
    level: level || undefined,
    categoryId: categoryId || undefined,
  });

  function clearFilters() {
    setLevel('');
    setCategoryId('');
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Courses
        </h1>
        <CourseFilters
          level={level}
          onLevelChange={(value) => {
            setLevel(value);
            setPage(1);
          }}
          categoryId={categoryId}
          onCategoryChange={(value) => {
            setCategoryId(value);
            setPage(1);
          }}
        />
      </div>

      {isPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-card border border-danger-200 bg-danger-50 px-4 py-10 text-center dark:border-danger-500/30 dark:bg-danger-500/10">
          <p className="text-sm font-medium text-danger-700 dark:text-danger-400">
            Could not load courses. Please try again later.
          </p>
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-surface-200 px-4 py-16 text-center dark:border-slate-700">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            No courses found{hasActiveFilters ? ' for these filters' : ''}.
          </p>
          {hasActiveFilters && (
            <Button variant="secondary" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
