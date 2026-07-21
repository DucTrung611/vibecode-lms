import { useNavigate, useParams } from 'react-router-dom';
import { Skeleton } from '@/shared/components/Skeleton';
import { CertificateVerification } from '../components/CertificateVerification';
import { VerifyCodeForm } from '../components/VerifyCodeForm';
import { useVerifyCertificate } from '../hooks/useVerifyCertificate';

export default function CertificateVerifyPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { data: certificate, isPending, isError } = useVerifyCertificate(code);

  if (!code) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-xl font-semibold text-gray-900">
          Verify a certificate
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter the code printed on a certificate to confirm it's genuine.
        </p>
        <VerifyCodeForm
          onSubmit={(value) => navigate(`/certificates/verify/${value}`)}
        />
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="mx-auto max-w-md space-y-4 px-4 py-12">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError || !certificate) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <p className="text-center text-red-600">
          This certificate code is not valid.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <CertificateVerification certificate={certificate} />
    </div>
  );
}
