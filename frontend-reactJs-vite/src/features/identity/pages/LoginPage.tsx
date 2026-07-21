import { LoginForm } from '../components/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
      <LoginForm />
    </div>
  );
}
