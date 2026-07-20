import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryProvider } from '@/app/providers/QueryProvider';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { router } from '@/app/routes/router';

export function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryProvider>
  );
}
