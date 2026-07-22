import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/Button';
import { useRegister } from '../hooks/useRegister';
import { registerSchema, type RegisterPayload } from '../types/identity.types';

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

export function RegisterForm() {
  const register_ = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterPayload>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'STUDENT' },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => register_.mutate(values))}
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
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          className={inputClass(!!errors.email)}
          {...register('email')}
        />
        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          className={inputClass(!!errors.password)}
          {...register('password')}
        />
        {errors.password && <p className={errorClass}>{errors.password.message}</p>}
      </div>

      <div>
        <label htmlFor="role" className={labelClass}>
          I am a
        </label>
        <select id="role" className={inputClass()} {...register('role')}>
          <option value="STUDENT">Student</option>
          <option value="INSTRUCTOR">Instructor</option>
        </select>
      </div>

      <Button type="submit" className="w-full" loading={register_.isPending}>
        {register_.isPending ? 'Creating account…' : 'Create account'}
      </Button>

      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{' '}
        <Link
          to="/login"
          className="rounded-sm font-medium text-brand-600 underline-offset-2 transition-colors hover:text-brand-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
