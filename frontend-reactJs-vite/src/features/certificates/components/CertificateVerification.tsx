import type { Certificate } from '../types/certificate.types';

interface CertificateVerificationProps {
  certificate: Certificate;
}

export function CertificateVerification({
  certificate,
}: CertificateVerificationProps) {
  return (
    <div className="rounded-card border border-success-200 bg-success-50 p-6 shadow-card dark:border-success-500/30 dark:bg-success-500/10 sm:p-8">
      <div className="flex items-center gap-2">
        <svg
          className="h-5 w-5 shrink-0 text-success-600 dark:text-success-400"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-sm font-semibold text-success-700 dark:text-success-400">
          Valid certificate
        </p>
      </div>
      <h1 className="mt-3 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        {certificate.course?.title ?? 'Untitled course'}
      </h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Issued to{' '}
        <span className="font-medium text-slate-900 dark:text-slate-100">
          {certificate.student?.fullName ?? 'Unknown student'}
        </span>
      </p>
      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-success-200 pt-4 text-sm dark:border-success-500/20">
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Code</dt>
          <dd className="mt-0.5 font-mono font-medium text-slate-900 dark:text-slate-100">
            {certificate.certificateCode}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Issued</dt>
          <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-100">
            {new Date(certificate.issuedAt).toLocaleDateString()}
          </dd>
        </div>
      </dl>
    </div>
  );
}
