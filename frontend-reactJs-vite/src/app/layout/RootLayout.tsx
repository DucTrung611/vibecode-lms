import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Footer } from './Footer';
import { Header } from './Header';

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-50 dark:bg-slate-950">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
