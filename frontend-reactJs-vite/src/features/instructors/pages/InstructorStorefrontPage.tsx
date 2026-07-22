import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Skeleton } from '@/shared/components/Skeleton';
import { InstructorCourseGrid } from '../components/InstructorCourseGrid';
import { InstructorHeader } from '../components/InstructorHeader';
import { useInstructorProfile } from '../hooks/useInstructorProfile';

export default function InstructorStorefrontPage() {
  const { id } = useParams<{ id: string }>();
  const { data: profile, isPending, isError } = useInstructorProfile(id);
  const [page, setPage] = useState(1);

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto max-w-3xl rounded-card border border-danger-200 bg-danger-50 px-4 py-10 text-center dark:border-danger-500/30 dark:bg-danger-500/10">
        <p className="text-sm font-medium text-danger-700 dark:text-danger-400">
          Could not load this instructor. They may not exist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <InstructorHeader profile={profile} />
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Courses
        </h2>
        <InstructorCourseGrid
          instructorId={id!}
          page={page}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
