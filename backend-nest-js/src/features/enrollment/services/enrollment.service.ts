import { Injectable, Logger } from '@nestjs/common';
import { CoursesService } from '../../courses/services/courses.service';
import { ApiException } from '../../../shared/types/api-error-code.type';
import { PaginatedResult } from '../../../shared/types/paginated-result.type';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  normalizePagination,
} from '../../../shared/utils/pagination.util';
import { UpdateProgressDto } from '../dto/update-progress.dto';
import { EnrollmentEntity } from '../entities/enrollment.entity';
import { LessonProgressEntity } from '../entities/lesson-progress.entity';
import { EnrollmentRepository } from '../repositories/enrollment.repository';
import { LessonProgressRepository } from '../repositories/lesson-progress.repository';

@Injectable()
export class EnrollmentService {
  private readonly logger = new Logger(EnrollmentService.name);

  constructor(
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly lessonProgressRepository: LessonProgressRepository,
    private readonly coursesService: CoursesService,
  ) {}

  async enroll(studentId: string, courseId: string): Promise<EnrollmentEntity> {
    const course = await this.coursesService.findById(courseId);

    const existing = await this.enrollmentRepository.findByStudentAndCourse(
      studentId,
      courseId,
    );
    if (existing) {
      throw new ApiException(
        409,
        'ENROLLMENT_001',
        'Already enrolled in this course',
      );
    }

    if (course.price > 0) {
      throw new ApiException(
        402,
        'PAYMENT_001',
        'Payment required for this course',
      );
    }

    const enrollment = await this.enrollmentRepository.create({
      studentId,
      courseId,
    });

    this.logger.log(`Student ${studentId} enrolled in course ${courseId}`);
    return EnrollmentEntity.fromPrisma(enrollment);
  }

  async findMyEnrollments(
    studentId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<EnrollmentEntity>> {
    const normalized = normalizePagination({
      page: page ?? DEFAULT_PAGE,
      limit: limit ?? DEFAULT_LIMIT,
    });

    const { items, total } = await this.enrollmentRepository.findByStudent(
      studentId,
      normalized.page,
      normalized.limit,
    );

    return {
      items: items.map((enrollment) => EnrollmentEntity.fromPrisma(enrollment)),
      meta: { page: normalized.page, limit: normalized.limit, total },
    };
  }

  async updateProgress(
    studentId: string,
    enrollmentId: string,
    dto: UpdateProgressDto,
  ): Promise<LessonProgressEntity> {
    const enrollment = await this.enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new ApiException(404, 'ENROLLMENT_002', 'Enrollment not found');
    }
    if (enrollment.studentId !== studentId) {
      throw new ApiException(
        403,
        'AUTH_003',
        'This enrollment does not belong to you',
      );
    }

    const course = await this.coursesService.findById(enrollment.courseId);
    const allLessonIds = (course.modules ?? []).flatMap((module) =>
      (module.lessons ?? []).map((lesson) => lesson.id),
    );
    if (!allLessonIds.includes(dto.lessonId)) {
      throw new ApiException(
        404,
        'ENROLLMENT_003',
        'Lesson not found in this course',
      );
    }

    const completedAt =
      dto.status === 'COMPLETED' ? new Date() : dto.status ? null : undefined;

    const progress = await this.lessonProgressRepository.upsert(
      enrollment.id,
      dto.lessonId,
      {
        status: dto.status,
        watchedSeconds: dto.watchedSeconds,
        completedAt,
      },
    );

    await this.maybeCompleteEnrollment(enrollment.id, allLessonIds);

    return LessonProgressEntity.fromPrisma(progress);
  }

  private async maybeCompleteEnrollment(
    enrollmentId: string,
    allLessonIds: string[],
  ): Promise<void> {
    if (allLessonIds.length === 0) {
      return;
    }

    const completedIds =
      await this.lessonProgressRepository.findCompletedLessonIds(enrollmentId);
    const completedSet = new Set(completedIds);
    const allCompleted = allLessonIds.every((id) => completedSet.has(id));

    if (allCompleted) {
      await this.enrollmentRepository.markCompleted(enrollmentId);
    }
  }
}
