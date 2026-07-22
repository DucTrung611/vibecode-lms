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
import { CreateLessonAnswerDto } from '../dto/create-lesson-answer.dto';
import { CreateLessonQuestionDto } from '../dto/create-lesson-question.dto';
import { LessonAnswerEntity } from '../entities/lesson-answer.entity';
import { LessonQuestionEntity } from '../entities/lesson-question.entity';
import { DiscussionRepository } from '../repositories/discussion.repository';

@Injectable()
export class DiscussionsService {
  private readonly logger = new Logger(DiscussionsService.name);

  constructor(
    private readonly discussionRepository: DiscussionRepository,
    private readonly coursesService: CoursesService,
    private readonly enrollmentService: EnrollmentService,
  ) {}

  async findByLesson(
    userId: string,
    userRole: string,
    lessonId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<LessonQuestionEntity>> {
    await this.assertLessonAccess(userId, userRole, lessonId);

    const normalized = normalizePagination({
      page: page ?? DEFAULT_PAGE,
      limit: limit ?? DEFAULT_LIMIT,
    });
    const { items, total } = await this.discussionRepository.findByLessonWithAnswers(
      lessonId,
      normalized.page,
      normalized.limit,
    );
    return {
      items: items.map((question) => LessonQuestionEntity.fromPrisma(question)),
      meta: { page: normalized.page, limit: normalized.limit, total },
    };
  }

  async createQuestion(
    studentId: string,
    lessonId: string,
    dto: CreateLessonQuestionDto,
  ): Promise<LessonQuestionEntity> {
    const courseId = await this.coursesService.findCourseIdByLessonId(lessonId);
    const isEnrolled = await this.enrollmentService.isEnrolled(studentId, courseId);
    if (!isEnrolled) {
      throw new ApiException(
        403,
        'AUTH_003',
        'You must be enrolled in this course to ask a question',
      );
    }

    const question = await this.discussionRepository.createQuestion({
      lessonId,
      studentId,
      content: dto.content,
    });

    this.logger.log(`Student ${studentId} asked question ${question.id} on lesson ${lessonId}`);
    return LessonQuestionEntity.fromPrisma(question);
  }

  async createAnswer(
    userId: string,
    userRole: string,
    questionId: string,
    dto: CreateLessonAnswerDto,
  ): Promise<LessonAnswerEntity> {
    const question = await this.discussionRepository.findQuestionById(questionId);
    if (!question) {
      throw new ApiException(404, 'DISCUSSION_001', 'Question not found');
    }

    const courseId = await this.coursesService.findCourseIdByLessonId(question.lessonId);
    await this.assertCanAnswer(userId, userRole, courseId);

    const answer = await this.discussionRepository.createAnswer({
      questionId,
      authorId: userId,
      content: dto.content,
    });

    this.logger.log(`User ${userId} answered question ${questionId}`);
    return LessonAnswerEntity.fromPrisma(answer);
  }

  private async assertLessonAccess(
    userId: string,
    userRole: string,
    lessonId: string,
  ): Promise<void> {
    const courseId = await this.coursesService.findCourseIdByLessonId(lessonId);
    await this.assertCanAnswer(userId, userRole, courseId);
  }

  private async assertCanAnswer(
    userId: string,
    userRole: string,
    courseId: string,
  ): Promise<void> {
    if (userRole === 'INSTRUCTOR') {
      const course = await this.coursesService.findById(courseId);
      if (course.instructorId !== userId) {
        throw new ApiException(403, 'AUTH_003', 'You do not own this course');
      }
      return;
    }

    const isEnrolled = await this.enrollmentService.isEnrolled(userId, courseId);
    if (!isEnrolled) {
      throw new ApiException(
        403,
        'AUTH_003',
        'You must be enrolled in this course to access its discussions',
      );
    }
  }
}
