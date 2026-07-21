import { api, unwrap } from '@/shared/services/api';
import type { ApiSuccess } from '@/shared/types/api.types';
import type { Certificate } from '../types/certificate.types';

export const certificateService = {
  listMine: async (page: number, limit: number) => {
    const response = await api.get<ApiSuccess<Certificate[]>>(
      '/certificates/me',
      { params: { page, limit } },
    );
    return { items: response.data.data, meta: response.data.meta! };
  },

  verifyByCode: (code: string) =>
    api.get<ApiSuccess<Certificate>>(`/certificates/${code}/verify`).then(unwrap),
};
