import type { Certificate } from '../types/certificate.types';

interface CertificateCardProps {
  certificate: Certificate;
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  return (
    <li className="flex items-center gap-4 rounded-card border border-slate-200 bg-surface-0 p-4 shadow-card transition-shadow duration-150 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
        aria-hidden="true"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
            clipRule="evenodd"
          />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
          {certificate.course?.title ?? 'Untitled course'}
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Issued {new Date(certificate.issuedAt).toLocaleDateString()} ·{' '}
          <span className="font-mono text-slate-600 dark:text-slate-300">
            {certificate.certificateCode}
          </span>
        </p>
      </div>
      <a
        href={certificate.certificateUrl}
        target="_blank"
        rel="noreferrer"
        className="shrink-0 whitespace-nowrap rounded-control px-3 py-1.5 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:bg-brand-100 dark:text-brand-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-300 dark:active:bg-brand-500/20"
      >
        View →
      </a>
    </li>
  );
}
