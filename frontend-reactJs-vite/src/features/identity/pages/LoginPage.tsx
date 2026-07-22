import { LoginForm } from '../components/LoginForm';

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col justify-center py-10 sm:py-16">
      <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Sign in
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Welcome back — enter your details to continue.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
