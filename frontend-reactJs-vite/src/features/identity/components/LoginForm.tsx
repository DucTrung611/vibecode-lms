import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/Button';
import { useLogin } from '../hooks/useLogin';
import { loginSchema, type LoginPayload } from '../types/identity.types';

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

export function LoginForm() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>({ resolver: zodResolver(loginSchema) });

  return (
    <form
      onSubmit={handleSubmit((values) => login.mutate(values))}
      className="w-full space-y-4"
      noValidate
    >
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
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          className={inputClass(!!errors.password)}
          {...register('password')}
        />
        {errors.password && <p className={errorClass}>{errors.password.message}</p>}
      </div>

      <Button type="submit" className="w-full" loading={login.isPending}>
        {login.isPending ? 'Signing in…' : 'Sign in'}
      </Button>

      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="rounded-sm font-medium text-brand-600 underline-offset-2 transition-colors hover:text-brand-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
