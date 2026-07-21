import { Injectable, Logger } from '@nestjs/common';
import { AiClientService } from '../../../core/ai/ai-client.service';
import { ApiException } from '../../../shared/types/api-error-code.type';
import { PaginatedResult } from '../../../shared/types/paginated-result.type';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  normalizePagination,
} from '../../../shared/utils/pagination.util';
import { CoursesService } from '../../courses/services/courses.service';
import { GenerateLearningPathDto } from '../dto/generate-learning-path.dto';
import { LearningPathEnrollmentEntity } from '../entities/learning-path-enrollment.entity';
import { LearningPathEntity } from '../entities/learning-path.entity';
import { LearningPathEnrollmentRepository } from '../repositories/learning-path-enrollment.repository';
import { LearningPathRepository } from '../repositories/learning-path.repository';
import { buildLearningPathPrompt } from '../utils/learning-path-prompt.util';
import { parseGeneratedLearningPath } from '../utils/parse-generated-learning-path.util';

const MAX_CANDIDATE_COURSES = 100;

@Injectable()
export class LearningPathsService {
  private readonly logger = new Logger(LearningPathsService.name);

  constructor(
    private readonly learningPathRepository: LearningPathRepository,
    private readonly enrollmentRepository: LearningPathEnrollmentRepository,
    private readonly coursesService: CoursesService,
    private readonly aiClient: AiClientService,
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

  async generate(
    studentId: string,
    dto: GenerateLearningPathDto,
  ): Promise<LearningPathEntity> {
    const { items: courses } = await this.coursesService.findAll({
      status: 'PUBLISHED',
      limit: MAX_CANDIDATE_COURSES,
    });
    if (courses.length === 0) {
      throw new ApiException(
        422,
        'LEARNING_PATH_004',
        'No published courses available to build a learning path from',
      );
    }

    const candidates = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      level: course.level,
    }));

    const raw = await this.aiClient.complete([
      {
        role: 'system',
        content:
          'You design course learning paths strictly as JSON, with no prose or markdown.',
      },
      {
        role: 'user',
        content: buildLearningPathPrompt(candidates, dto.topic),
      },
    ]);
    const generated = parseGeneratedLearningPath(
      raw,
      new Set(candidates.map((course) => course.id)),
    );

    const path = await this.learningPathRepository.createGenerated({
      title: generated.title,
      description: generated.description,
      createdById: studentId,
      courseIds: generated.courseIds,
    });

    this.logger.log(
      `AI-generated learning path ${path.id} for student ${studentId}`,
    );
    return LearningPathEntity.fromPrisma(path);
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
