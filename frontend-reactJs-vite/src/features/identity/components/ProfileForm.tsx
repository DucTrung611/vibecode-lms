import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/components/Button';
import { FileUploadButton } from '@/shared/components/FileUploadButton';
import type { AuthUser } from '@/shared/types/api.types';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import {
  updateProfileSchema,
  type UpdateProfilePayload,
} from '../types/identity.types';

interface ProfileFormProps {
  user: AuthUser;
}

const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300';
const errorClass = 'mt-1.5 text-sm text-danger-600 dark:text-danger-500';
const baseInputClass =
  'mt-1.5 w-full rounded-control border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500';
const inputClass = (hasError?: boolean) =>
  `${baseInputClass} ${
    hasError
      ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/30 dark:border-danger-500'
      : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500/30 dark:border-slate-700'
  }`;

export function ProfileForm({ user }: ProfileFormProps) {
  const updateProfile = useUpdateProfile();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateProfilePayload>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { fullName: user.fullName },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => updateProfile.mutate(values))}
      className="w-full space-y-4"
      noValidate
    >
      <div>
        <label htmlFor="fullName" className={labelClass}>
          Full name
        </label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          aria-invalid={!!errors.fullName}
          className={inputClass(!!errors.fullName)}
          {...register('fullName')}
        />
        {errors.fullName && <p className={errorClass}>{errors.fullName.message}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="avatarUrl" className={labelClass}>
            Avatar URL
          </label>
          <FileUploadButton
            accept="image/*"
            label="Upload photo"
            onUploaded={(fileUrl) =>
              setValue('avatarUrl', fileUrl, { shouldValidate: true })
            }
          />
        </div>
        <input
          id="avatarUrl"
          type="url"
          placeholder="https://…"
          aria-invalid={!!errors.avatarUrl}
          className={inputClass(!!errors.avatarUrl)}
          {...register('avatarUrl')}
        />
        {errors.avatarUrl && <p className={errorClass}>{errors.avatarUrl.message}</p>}
      </div>

      <Button type="submit" loading={updateProfile.isPending}>
        {updateProfile.isPending ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  );
}
