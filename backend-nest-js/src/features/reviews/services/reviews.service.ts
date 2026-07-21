import { Injectable, Logger } from '@nestjs/common';
import { CoursesService } from '../../courses/services/courses.service';
import { EnrollmentService } from '../../enrollment/services/enrollment.service';
import { ApiException } from '../../../shared/types/api-error-code.type';
import { PaginatedResult } from '../../../shared/types/paginated-result.type';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  normalizePagination,
} from '../../../shared/utils/pagination.util';
import { CreateReviewDto } from '../dto/create-review.dto';
import { ReviewEntity } from '../entities/review.entity';
import { ReviewRepository } from '../repositories/review.repository';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly coursesService: CoursesService,
    private readonly enrollmentService: EnrollmentService,
  ) {}

  async findByCourse(
    courseId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<ReviewEntity>> {
    await this.coursesService.findById(courseId);

    const normalized = normalizePagination({
      page: page ?? DEFAULT_PAGE,
      limit: limit ?? DEFAULT_LIMIT,
    });

    const { items, total } = await this.reviewRepository.findByCourse(
      courseId,
      normalized.page,
      normalized.limit,
    );

    return {
      items: items.map((review) => ReviewEntity.fromPrisma(review)),
      meta: { page: normalized.page, limit: normalized.limit, total },
    };
  }

  async create(
    studentId: string,
    courseId: string,
    dto: CreateReviewDto,
  ): Promise<ReviewEntity> {
    await this.coursesService.findById(courseId);

    const isEnrolled = await this.enrollmentService.isEnrolled(
      studentId,
      courseId,
    );
    if (!isEnrolled) {
      throw new ApiException(
        403,
        'AUTH_003',
        'You must be enrolled in this course to review it',
      );
    }

    const existing = await this.reviewRepository.findByStudentAndCourse(
      studentId,
      courseId,
    );
    if (existing) {
      throw new ApiException(
        409,
        'REVIEW_001',
        'You have already reviewed this course',
      );
    }

    const review = await this.reviewRepository.create({
      courseId,
      studentId,
      rating: dto.rating,
      comment: dto.comment,
    });

    this.logger.log(`Student ${studentId} reviewed course ${courseId}`);
    return ReviewEntity.fromPrisma(review);
  }
}
