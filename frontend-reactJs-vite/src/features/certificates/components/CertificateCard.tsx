import type { Certificate } from '../types/certificate.types';

interface CertificateCardProps {
  certificate: Certificate;
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  return (
    <li className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
      <div>
        <p className="font-medium text-gray-900">
          {certificate.course?.title ?? 'Untitled course'}
        </p>
        <p className="text-sm text-gray-500">
          Issued {new Date(certificate.issuedAt).toLocaleDateString()} ·{' '}
          <span className="font-mono">{certificate.certificateCode}</span>
        </p>
      </div>
      <a
        href={certificate.certificateUrl}
        target="_blank"
        rel="noreferrer"
        className="whitespace-nowrap text-sm font-medium text-purple-600 hover:underline"
      >
        View
      </a>
    </li>
  );
}
