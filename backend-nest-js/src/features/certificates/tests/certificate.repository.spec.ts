import { Certificate } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { CertificateRepository } from '../repositories/certificate.repository';

describe('CertificateRepository', () => {
  let repository: CertificateRepository;
  let prisma: {
    certificate: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
    };
  };

  const fakeCertificate = { id: 'cert_1' } as Certificate;

  beforeEach(() => {
    prisma = {
      certificate: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
      },
    };
    repository = new CertificateRepository(prisma as unknown as PrismaService);
  });

  describe('findByStudentAndCourse', () => {
    it('queries by the compound unique key', async () => {
      prisma.certificate.findUnique.mockResolvedValue(fakeCertificate);

      const result = await repository.findByStudentAndCourse(
        'student_1',
        'course_1',
      );

      expect(prisma.certificate.findUnique).toHaveBeenCalledWith({
        where: {
          studentId_courseId: { studentId: 'student_1', courseId: 'course_1' },
        },
      });
      expect(result).toBe(fakeCertificate);
    });
  });

  describe('findByCode', () => {
    it('queries by certificateCode including course and student', async () => {
      prisma.certificate.findUnique.mockResolvedValue(fakeCertificate);

      const result = await repository.findByCode('ABC123');

      expect(prisma.certificate.findUnique).toHaveBeenCalledWith({
        where: { certificateCode: 'ABC123' },
        include: { course: true, student: true },
      });
      expect(result).toBe(fakeCertificate);
    });
  });

  describe('findByStudent', () => {
    it('paginates and includes the course, ordered by most recently issued', async () => {
      prisma.certificate.findMany.mockResolvedValue([fakeCertificate]);
      prisma.certificate.count.mockResolvedValue(1);

      const result = await repository.findByStudent('student_1', 2, 10);

      expect(prisma.certificate.findMany).toHaveBeenCalledWith({
        where: { studentId: 'student_1' },
        include: { course: true },
        orderBy: { issuedAt: 'desc' },
        skip: 10,
        take: 10,
      });
      expect(prisma.certificate.count).toHaveBeenCalledWith({
        where: { studentId: 'student_1' },
      });
      expect(result).toEqual({ items: [fakeCertificate], total: 1 });
    });
  });

  describe('create', () => {
    it('passes data straight through to prisma', async () => {
      prisma.certificate.create.mockResolvedValue(fakeCertificate);
      const data = {
        studentId: 'student_1',
        courseId: 'course_1',
        certificateCode: 'ABC123',
        certificateUrl: '/certificates/ABC123.pdf',
      };

      const result = await repository.create(data);

      expect(prisma.certificate.create).toHaveBeenCalledWith({ data });
      expect(result).toBe(fakeCertificate);
    });
  });
});
