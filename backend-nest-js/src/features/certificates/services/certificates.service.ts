import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ENROLLMENT_COMPLETED_EVENT } from '../../../shared/events/enrollment-completed.event';
import type { EnrollmentCompletedEvent } from '../../../shared/events/enrollment-completed.event';
import { ApiException } from '../../../shared/types/api-error-code.type';
import { PaginatedResult } from '../../../shared/types/paginated-result.type';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  normalizePagination,
} from '../../../shared/utils/pagination.util';
import { CertificateEntity } from '../entities/certificate.entity';
import { CertificateRepository } from '../repositories/certificate.repository';
import { generateCertificateCode } from '../utils/certificate-code.util';

@Injectable()
export class CertificatesService {
  private readonly logger = new Logger(CertificatesService.name);

  constructor(private readonly certificateRepository: CertificateRepository) {}

  @OnEvent(ENROLLMENT_COMPLETED_EVENT)
  async handleEnrollmentCompleted(
    event: EnrollmentCompletedEvent,
  ): Promise<void> {
    try {
      const existing = await this.certificateRepository.findByStudentAndCourse(
        event.studentId,
        event.courseId,
      );
      if (existing) {
        return;
      }

      const certificateCode = await this.generateUniqueCode();
      await this.certificateRepository.create({
        studentId: event.studentId,
        courseId: event.courseId,
        certificateCode,
        certificateUrl: `/certificates/${certificateCode}.pdf`,
      });

      this.logger.log(
        `Issued certificate ${certificateCode} to student ${event.studentId} for course ${event.courseId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to issue certificate for student ${event.studentId}, course ${event.courseId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async findMyCertificates(
    studentId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<CertificateEntity>> {
    const normalized = normalizePagination({
      page: page ?? DEFAULT_PAGE,
      limit: limit ?? DEFAULT_LIMIT,
    });

    const { items, total } = await this.certificateRepository.findByStudent(
      studentId,
      normalized.page,
      normalized.limit,
    );

    return {
      items: items.map((certificate) =>
        CertificateEntity.fromPrisma(certificate),
      ),
      meta: { page: normalized.page, limit: normalized.limit, total },
    };
  }

  async verifyByCode(code: string): Promise<CertificateEntity> {
    const certificate = await this.certificateRepository.findByCode(code);
    if (!certificate) {
      throw new ApiException(404, 'CERTIFICATE_001', 'Certificate not found');
    }
    return CertificateEntity.fromPrisma(certificate);
  }

  private async generateUniqueCode(): Promise<string> {
    let candidate = generateCertificateCode();
    while (await this.certificateRepository.findByCode(candidate)) {
      candidate = generateCertificateCode();
    }
    return candidate;
  }
}
