import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/components/Button';
import type { AuthUser } from '@/shared/types/api.types';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import {
  updateProfileSchema,
  type UpdateProfilePayload,
} from '../types/identity.types';

interface ProfileFormProps {
  user: AuthUser;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const updateProfile = useUpdateProfile();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfilePayload>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { fullName: user.fullName },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => updateProfile.mutate(values))}
      className="w-full max-w-sm space-y-4"
      noValidate
    >
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
          Full name
        </label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          {...register('fullName')}
        />
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="avatarUrl"
          className="block text-sm font-medium text-gray-700"
        >
          Avatar URL
        </label>
        <input
          id="avatarUrl"
          type="url"
          placeholder="https://…"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          {...register('avatarUrl')}
        />
        {errors.avatarUrl && (
          <p className="mt-1 text-sm text-red-600">{errors.avatarUrl.message}</p>
        )}
      </div>

      <Button type="submit" disabled={updateProfile.isPending}>
        {updateProfile.isPending ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  );
}
