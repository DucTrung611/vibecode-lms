import { RegisterForm } from '../components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col justify-center py-10 sm:py-16">
      <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Join to start learning or teaching on vibecode-lms.
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
