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
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Verify a certificate
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
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
      <div className="mx-auto max-w-md space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 w-full rounded-card" />
      </div>
    );
  }

  if (isError || !certificate) {
    return (
      <div className="mx-auto max-w-md">
        <div className="rounded-card border border-danger-200 bg-danger-50 p-6 text-center shadow-card dark:border-danger-500/30 dark:bg-danger-500/10">
          <p className="text-sm font-semibold text-danger-700 dark:text-danger-400">
            Invalid certificate
          </p>
          <p className="mt-1 text-sm text-danger-600 dark:text-danger-400/90">
            This certificate code is not valid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <CertificateVerification certificate={certificate} />
    </div>
  );
}
