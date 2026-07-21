import { generateCertificateCode } from '../utils/certificate-code.util';

describe('generateCertificateCode', () => {
  it('produces a 16-char uppercase hex string', () => {
    const code = generateCertificateCode();

    expect(code).toMatch(/^[0-9A-F]{16}$/);
  });

  it('produces different codes across calls', () => {
    const first = generateCertificateCode();
    const second = generateCertificateCode();

    expect(first).not.toBe(second);
  });
});
