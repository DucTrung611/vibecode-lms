import { Injectable, Logger } from '@nestjs/common';
import { ApiException } from '../../../shared/types/api-error-code.type';
import { PaginatedResult } from '../../../shared/types/paginated-result.type';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  normalizePagination,
} from '../../../shared/utils/pagination.util';
import { LearningPathEnrollmentEntity } from '../entities/learning-path-enrollment.entity';
import { LearningPathEntity } from '../entities/learning-path.entity';
import { LearningPathEnrollmentRepository } from '../repositories/learning-path-enrollment.repository';
import { LearningPathRepository } from '../repositories/learning-path.repository';

@Injectable()
export class LearningPathsService {
  private readonly logger = new Logger(LearningPathsService.name);

  constructor(
    private readonly learningPathRepository: LearningPathRepository,
    private readonly enrollmentRepository: LearningPathEnrollmentRepository,
  ) {}

  async findAll(
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<LearningPathEntity>> {
    const normalized = normalizePagination({
      page: page ?? DEFAULT_PAGE,
      limit: limit ?? DEFAULT_LIMIT,
    });

    const { items, total } = await this.learningPathRepository.findMany(
      normalized.page,
      normalized.limit,
    );

    return {
      items: items.map((path) => LearningPathEntity.fromPrisma(path)),
      meta: { page: normalized.page, limit: normalized.limit, total },
    };
  }

  async enroll(
    studentId: string,
    learningPathId: string,
  ): Promise<LearningPathEnrollmentEntity> {
    const path = await this.learningPathRepository.findById(learningPathId);
    if (!path) {
      throw new ApiException(
        404,
        'LEARNING_PATH_001',
        'Learning path not found',
      );
    }

    const existing = await this.enrollmentRepository.findByStudentAndPath(
      studentId,
      learningPathId,
    );
    if (existing) {
      throw new ApiException(
        409,
        'LEARNING_PATH_002',
        'Already enrolled in this learning path',
      );
    }

    const enrollment = await this.enrollmentRepository.create({
      studentId,
      learningPathId,
    });

    this.logger.log(
      `Student ${studentId} enrolled in learning path ${learningPathId}`,
    );
    return LearningPathEnrollmentEntity.fromPrisma(enrollment);
  }
}
