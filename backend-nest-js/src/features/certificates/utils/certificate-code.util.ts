import { randomBytes } from 'crypto';

export function generateCertificateCode(): string {
  return randomBytes(8).toString('hex').toUpperCase();
}
