import { Injectable } from '@nestjs/common';
import { Certificate } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';

export interface CreateCertificateData {
  studentId: string;
  courseId: string;
  certificateCode: string;
  certificateUrl: string;
}

@Injectable()
export class CertificateRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByStudentAndCourse(
    studentId: string,
    courseId: string,
  ): Promise<Certificate | null> {
    return this.prisma.certificate.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
  }

  findByCode(code: string) {
    return this.prisma.certificate.findUnique({
      where: { certificateCode: code },
      include: { course: true, student: true },
    });
  }

  async findByStudent(studentId: string, page: number, limit: number) {
    const where = { studentId };
    const [items, total] = await Promise.all([
      this.prisma.certificate.findMany({
        where,
        include: { course: true },
        orderBy: { issuedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.certificate.count({ where }),
    ]);
    return { items, total };
  }

  create(data: CreateCertificateData): Promise<Certificate> {
    return this.prisma.certificate.create({ data });
  }
}
