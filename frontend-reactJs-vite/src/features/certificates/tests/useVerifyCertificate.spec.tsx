import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { certificateService } from '../services/certificate.service';
import { useVerifyCertificate } from '../hooks/useVerifyCertificate';

vi.mock('../services/certificate.service', () => ({
  certificateService: { verifyByCode: vi.fn() },
}));

describe('useVerifyCertificate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('verifies the certificate by code', async () => {
    vi.mocked(certificateService.verifyByCode).mockResolvedValue({
      id: 'cert_1',
      certificateCode: 'ABC123',
    } as never);

    const { result } = renderHook(() => useVerifyCertificate('ABC123'), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(certificateService.verifyByCode).toHaveBeenCalledWith('ABC123');
    expect(result.current.data).toEqual({
      id: 'cert_1',
      certificateCode: 'ABC123',
    });
  });

  it('does not fetch when code is undefined', () => {
    const { result } = renderHook(() => useVerifyCertificate(undefined), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(certificateService.verifyByCode).not.toHaveBeenCalled();
  });

  it('does not retry on failure (bad codes should fail fast)', async () => {
    vi.mocked(certificateService.verifyByCode).mockRejectedValue(
      new Error('not found'),
    );

    const { result } = renderHook(() => useVerifyCertificate('bad-code'), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(certificateService.verifyByCode).toHaveBeenCalledTimes(1);
  });
});
