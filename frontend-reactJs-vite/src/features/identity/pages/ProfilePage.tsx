import { Skeleton } from '@/shared/components/Skeleton';
import { Button } from '@/shared/components/Button';
import { ProfileForm } from '../components/ProfileForm';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useLogout } from '../hooks/useLogout';

export default function ProfilePage() {
  const { data: user, isPending } = useCurrentUser();
  const logout = useLogout();

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">My profile</h1>
        <Button
          variant="ghost"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          Sign out
        </Button>
      </div>

      {isPending || !user ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <ProfileForm user={user} />
      )}
    </div>
  );
}
