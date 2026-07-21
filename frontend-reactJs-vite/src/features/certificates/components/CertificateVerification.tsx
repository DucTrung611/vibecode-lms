import type { Certificate } from '../types/certificate.types';

interface CertificateVerificationProps {
  certificate: Certificate;
}

export function CertificateVerification({
  certificate,
}: CertificateVerificationProps) {
  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-6">
      <p className="text-sm font-medium text-green-700">Valid certificate</p>
      <h1 className="mt-2 text-xl font-semibold text-gray-900">
        {certificate.course?.title ?? 'Untitled course'}
      </h1>
      <p className="mt-1 text-gray-600">
        Issued to {certificate.student?.fullName ?? 'Unknown student'}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
        <div>
          <dt className="text-gray-500">Code</dt>
          <dd className="font-mono font-medium text-gray-900">
            {certificate.certificateCode}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">Issued</dt>
          <dd className="font-medium text-gray-900">
            {new Date(certificate.issuedAt).toLocaleDateString()}
          </dd>
        </div>
      </dl>
    </div>
  );
}
