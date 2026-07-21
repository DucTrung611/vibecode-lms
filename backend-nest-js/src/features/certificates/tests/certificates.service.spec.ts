import { Certificate } from '@prisma/client';
import { EnrollmentCompletedEvent } from '../../../shared/events/enrollment-completed.event';
import { CertificateRepository } from '../repositories/certificate.repository';
import { CertificatesService } from '../services/certificates.service';

describe('CertificatesService', () => {
  let service: CertificatesService;
  let certificateRepository: jest.Mocked<
    Pick<
      CertificateRepository,
      'findByStudentAndCourse' | 'findByCode' | 'findByStudent' | 'create'
    >
  >;

  const event: EnrollmentCompletedEvent = {
    enrollmentId: 'enr_1',
    studentId: 'student_1',
    courseId: 'course_1',
  };

  const fakeCertificate: Certificate = {
    id: 'cert_1',
    studentId: 'student_1',
    courseId: 'course_1',
    certificateCode: 'ABC123',
    certificateUrl: '/certificates/ABC123.pdf',
    issuedAt: new Date('2026-01-01'),
  };

  beforeEach(() => {
    certificateRepository = {
      findByStudentAndCourse: jest.fn(),
      findByCode: jest.fn(),
      findByStudent: jest.fn(),
      create: jest.fn(),
    };

    service = new CertificatesService(
      certificateRepository as unknown as CertificateRepository,
    );
  });

  describe('handleEnrollmentCompleted', () => {
    it('issues a certificate with a unique code when none exists yet', async () => {
      certificateRepository.findByStudentAndCourse.mockResolvedValue(null);
      certificateRepository.findByCode.mockResolvedValue(null);
      certificateRepository.create.mockResolvedValue(fakeCertificate);

      await service.handleEnrollmentCompleted(event);

      expect(certificateRepository.findByStudentAndCourse).toHaveBeenCalledWith(
        'student_1',
        'course_1',
      );
      expect(certificateRepository.create).toHaveBeenCalledTimes(1);
      const createArg = certificateRepository.create.mock.calls[0][0];
      expect(createArg.studentId).toBe('student_1');
      expect(createArg.courseId).toBe('course_1');
      expect(createArg.certificateCode).toMatch(/^[0-9A-F]{16}$/);
      expect(createArg.certificateUrl).toBe(
        `/certificates/${createArg.certificateCode}.pdf`,
      );
    });

    it('is idempotent: does not create a second certificate for the same student/course', async () => {
      certificateRepository.findByStudentAndCourse.mockResolvedValue(
        fakeCertificate,
      );

      await service.handleEnrollmentCompleted(event);

      expect(certificateRepository.create).not.toHaveBeenCalled();
    });

    it('retries code generation on collision', async () => {
      certificateRepository.findByStudentAndCourse.mockResolvedValue(null);
      certificateRepository.findByCode
        .mockResolvedValueOnce(fakeCertificate)
        .mockResolvedValueOnce(null);
      certificateRepository.create.mockResolvedValue(fakeCertificate);

      await service.handleEnrollmentCompleted(event);

      expect(certificateRepository.findByCode).toHaveBeenCalledTimes(2);
      expect(certificateRepository.create).toHaveBeenCalledTimes(1);
    });

    it('swallows repository errors instead of throwing (event listeners must not crash)', async () => {
      certificateRepository.findByStudentAndCourse.mockRejectedValue(
        new Error('db down'),
      );

      await expect(
        service.handleEnrollmentCompleted(event),
      ).resolves.toBeUndefined();
    });
  });

  describe('findMyCertificates', () => {
    it('normalizes pagination defaults and maps results', async () => {
      certificateRepository.findByStudent.mockResolvedValue({
        items: [fakeCertificate],
        total: 1,
      } as never);

      const result = await service.findMyCertificates('student_1');

      expect(certificateRepository.findByStudent).toHaveBeenCalledWith(
        'student_1',
        1,
        20,
      );
      expect(result.meta).toEqual({ page: 1, limit: 20, total: 1 });
      expect(result.items[0].id).toBe('cert_1');
    });
  });

  describe('verifyByCode', () => {
    it('throws CERTIFICATE_001 (404) when the code does not match a certificate', async () => {
      certificateRepository.findByCode.mockResolvedValue(null);

      await expect(service.verifyByCode('missing')).rejects.toMatchObject({
        httpStatus: 404,
        code: 'CERTIFICATE_001',
      });
    });

    it('returns the certificate when found', async () => {
      certificateRepository.findByCode.mockResolvedValue(fakeCertificate);

      const result = await service.verifyByCode('ABC123');

      expect(result.certificateCode).toBe('ABC123');
    });
  });
});
