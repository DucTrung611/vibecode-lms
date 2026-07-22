import { Skeleton } from '@/shared/components/Skeleton';
import { Button } from '@/shared/components/Button';
import { ProfileForm } from '../components/ProfileForm';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useLogout } from '../hooks/useLogout';

function initials(name?: string) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function ProfilePage() {
  const { data: user, isPending } = useCurrentUser();
  const logout = useLogout();

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 py-10 sm:py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          My profile
        </h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logout.mutate()}
          loading={logout.isPending}
        >
          Sign out
        </Button>
      </div>

      <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        {isPending || !user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-pill" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-9 w-28" />
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-pill bg-brand-100 text-base font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-200">
                {initials(user.fullName)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900 dark:text-white">
                  {user.fullName}
                </p>
                <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>
              </div>
            </div>
            <ProfileForm user={user} />
          </>
        )}
      </div>
    </div>
  );
}
