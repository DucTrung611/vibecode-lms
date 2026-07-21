import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Enrollment } from '@prisma/client';
import { CoursesService } from '../../courses/services/courses.service';
import { PaymentsService } from '../../payments/services/payments.service';
import {
  ENROLLMENT_COMPLETED_EVENT,
  EnrollmentCompletedEvent,
} from '../../../shared/events/enrollment-completed.event';
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
    private readonly eventEmitter: EventEmitter2,
    private readonly paymentsService: PaymentsService,
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
      const hasPaid = await this.paymentsService.hasPaidOrderForCourse(
        studentId,
        courseId,
      );
      if (!hasPaid) {
        throw new ApiException(
          402,
          'PAYMENT_001',
          'Payment required for this course',
        );
      }
    }

    const enrollment = await this.enrollmentRepository.create({
      studentId,
      courseId,
    });

    this.logger.log(`Student ${studentId} enrolled in course ${courseId}`);
    return EnrollmentEntity.fromPrisma(enrollment);
  }

  async isEnrolled(studentId: string, courseId: string): Promise<boolean> {
    const enrollment = await this.enrollmentRepository.findByStudentAndCourse(
      studentId,
      courseId,
    );
    return enrollment !== null;
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

    await this.maybeCompleteEnrollment(enrollment, allLessonIds);

    return LessonProgressEntity.fromPrisma(progress);
  }

  private async maybeCompleteEnrollment(
    enrollment: Enrollment,
    allLessonIds: string[],
  ): Promise<void> {
    if (allLessonIds.length === 0 || enrollment.status === 'COMPLETED') {
      return;
    }

    const completedIds =
      await this.lessonProgressRepository.findCompletedLessonIds(enrollment.id);
    const completedSet = new Set(completedIds);
    const allCompleted = allLessonIds.every((id) => completedSet.has(id));

    if (allCompleted) {
      await this.enrollmentRepository.markCompleted(enrollment.id);

      const event: EnrollmentCompletedEvent = {
        enrollmentId: enrollment.id,
        studentId: enrollment.studentId,
        courseId: enrollment.courseId,
      };
      this.eventEmitter.emit(ENROLLMENT_COMPLETED_EVENT, event);
    }
  }
}
