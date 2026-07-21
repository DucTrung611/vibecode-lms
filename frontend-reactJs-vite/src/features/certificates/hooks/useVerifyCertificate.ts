import { useQuery } from '@tanstack/react-query';
import { certificateService } from '../services/certificate.service';

export function useVerifyCertificate(code: string | undefined) {
  return useQuery({
    queryKey: ['certificates', 'verify', code],
    queryFn: () => certificateService.verifyByCode(code!),
    enabled: Boolean(code),
    retry: false,
  });
}
