import { RegisterForm } from '../components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold text-gray-900">Create your account</h1>
      <RegisterForm />
    </div>
  );
}
