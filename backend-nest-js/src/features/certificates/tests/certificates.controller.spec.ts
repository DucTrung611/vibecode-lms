import { CertificatesController } from '../controllers/certificates.controller';
import { CertificatesService } from '../services/certificates.service';

describe('CertificatesController', () => {
  let controller: CertificatesController;
  let certificatesService: jest.Mocked<
    Pick<CertificatesService, 'findMyCertificates' | 'verifyByCode'>
  >;

  beforeEach(() => {
    certificatesService = {
      findMyCertificates: jest.fn(),
      verifyByCode: jest.fn(),
    };
    controller = new CertificatesController(
      certificatesService as unknown as CertificatesService,
    );
  });

  describe('findMine', () => {
    it('delegates to certificatesService.findMyCertificates with the current student and query', async () => {
      certificatesService.findMyCertificates.mockResolvedValue({
        items: [],
        meta: { page: 1, limit: 20, total: 0 },
      });

      const result = await controller.findMine('student_1', {
        page: 2,
        limit: 5,
      });

      expect(certificatesService.findMyCertificates).toHaveBeenCalledWith(
        'student_1',
        2,
        5,
      );
      expect(result).toEqual({
        items: [],
        meta: { page: 1, limit: 20, total: 0 },
      });
    });
  });

  describe('verify', () => {
    it('delegates to certificatesService.verifyByCode with the code param', async () => {
      certificatesService.verifyByCode.mockResolvedValue({
        id: 'cert_1',
      } as never);

      const result = await controller.verify('ABC123');

      expect(certificatesService.verifyByCode).toHaveBeenCalledWith('ABC123');
      expect(result).toEqual({ id: 'cert_1' });
    });
  });
});
