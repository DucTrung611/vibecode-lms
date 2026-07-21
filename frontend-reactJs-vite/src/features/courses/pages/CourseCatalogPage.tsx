import { useState } from 'react';
import { Pagination } from '@/shared/components/Pagination';
import { Skeleton } from '@/shared/components/Skeleton';
import { CourseCard } from '../components/CourseCard';
import { CourseFilters } from '../components/CourseFilters';
import { useCourses } from '../hooks/useCourses';
import type { CourseLevel } from '../types/courses.types';

export default function CourseCatalogPage() {
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState<CourseLevel | ''>('');
  const [categoryId, setCategoryId] = useState('');

  const { data, isPending, isError } = useCourses({
    page,
    limit: 12,
    status: 'PUBLISHED',
    level: level || undefined,
    categoryId: categoryId || undefined,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Courses</h1>
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
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-center text-red-600">
          Could not load courses. Please try again later.
        </p>
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
        <p className="text-center text-gray-500">No courses found.</p>
      )}
    </div>
  );
}
