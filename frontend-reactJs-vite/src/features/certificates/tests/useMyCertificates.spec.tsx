import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/shared/stores/auth.store';
import { createTestQueryClient, createWrapper } from '@/test/test-utils';
import { certificateService } from '../services/certificate.service';
import { useMyCertificates } from '../hooks/useMyCertificates';

vi.mock('../services/certificate.service', () => ({
  certificateService: { listMine: vi.fn() },
}));

describe('useMyCertificates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearSession();
  });

  it('fetches the certificate list with page/limit when authenticated', async () => {
    useAuthStore.setState({ accessToken: 'access-token' });
    const items = [{ id: 'cert_1' }];
    const meta = { page: 1, limit: 20, total: 1 };
    vi.mocked(certificateService.listMine).mockResolvedValue({
      items,
      meta,
    } as never);

    const { result } = renderHook(() => useMyCertificates(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(certificateService.listMine).toHaveBeenCalledWith(1, 20);
    expect(result.current.data).toEqual({ items, meta });
  });

  it('does not fetch when there is no access token', () => {
    const { result } = renderHook(() => useMyCertificates(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(certificateService.listMine).not.toHaveBeenCalled();
  });
});
