import { Injectable, Logger } from '@nestjs/common';
import { ApiException } from '../../../shared/types/api-error-code.type';
import { CoursesService } from '../../courses/services/courses.service';
import { EnrollmentService } from '../../enrollment/services/enrollment.service';
import { CreateSubmissionDto } from '../dto/create-submission.dto';
import { GradeSubmissionDto } from '../dto/grade-submission.dto';
import { AssignmentSubmissionEntity } from '../entities/assignment-submission.entity';
import { AssignmentEntity } from '../entities/assignment.entity';
import {
  AssignmentRepository,
  AssignmentWithCourse,
} from '../repositories/assignment.repository';
import { AssignmentSubmissionRepository } from '../repositories/assignment-submission.repository';

@Injectable()
export class AssignmentsService {
  private readonly logger = new Logger(AssignmentsService.name);

  constructor(
    private readonly assignmentRepository: AssignmentRepository,
    private readonly submissionRepository: AssignmentSubmissionRepository,
    private readonly coursesService: CoursesService,
    private readonly enrollmentService: EnrollmentService,
  ) {}

  async findById(
    studentId: string,
    assignmentId: string,
  ): Promise<AssignmentEntity> {
    const assignment = await this.getAssignmentOrThrow(assignmentId);
    await this.assertEnrolled(studentId, assignment);
    return AssignmentEntity.fromPrisma(assignment);
  }

  async submit(
    studentId: string,
    assignmentId: string,
    dto: CreateSubmissionDto,
  ): Promise<AssignmentSubmissionEntity> {
    const assignment = await this.getAssignmentOrThrow(assignmentId);
    await this.assertEnrolled(studentId, assignment);

    if (!dto.fileUrl && !dto.content) {
      throw new ApiException(
        400,
        'ASSIGNMENT_005',
        'Submission must include a fileUrl or content',
      );
    }

    const existing = await this.submissionRepository.findByAssignmentAndStudent(
      assignmentId,
      studentId,
    );
    if (existing) {
      throw new ApiException(
        409,
        'ASSIGNMENT_002',
        'You have already submitted this assignment',
      );
    }

    if (assignment.dueDate && new Date() > assignment.dueDate) {
      throw new ApiException(
        400,
        'ASSIGNMENT_003',
        'Submission after due date without late-submission policy',
      );
    }

    const submission = await this.submissionRepository.create({
      assignmentId,
      studentId,
      fileUrl: dto.fileUrl,
      content: dto.content,
    });

    this.logger.log(
      `Student ${studentId} submitted assignment ${assignmentId}`,
    );
    return AssignmentSubmissionEntity.fromPrisma(submission);
  }

  async gradeSubmission(
    graderId: string,
    submissionId: string,
    dto: GradeSubmissionDto,
  ): Promise<AssignmentSubmissionEntity> {
    const submission = await this.submissionRepository.findById(submissionId);
    if (!submission) {
      throw new ApiException(404, 'ASSIGNMENT_004', 'Submission not found');
    }

    const assignment = await this.getAssignmentOrThrow(submission.assignmentId);
    const course = await this.coursesService.findById(
      assignment.lesson.module.courseId,
    );
    if (course.instructorId !== graderId) {
      throw new ApiException(403, 'AUTH_003', 'You do not own this course');
    }

    if (dto.score > assignment.maxScore) {
      throw new ApiException(
        400,
        'ASSIGNMENT_006',
        `Score cannot exceed the assignment's max score (${assignment.maxScore})`,
      );
    }

    const graded = await this.submissionRepository.grade(submissionId, {
      score: dto.score,
      feedback: dto.feedback,
      gradedById: graderId,
    });

    this.logger.log(
      `Submission ${submissionId} graded by instructor ${graderId}`,
    );
    return AssignmentSubmissionEntity.fromPrisma(graded);
  }

  private async getAssignmentOrThrow(
    assignmentId: string,
  ): Promise<AssignmentWithCourse> {
    const assignment =
      await this.assignmentRepository.findByIdWithCourse(assignmentId);
    if (!assignment) {
      throw new ApiException(404, 'ASSIGNMENT_001', 'Assignment not found');
    }
    return assignment;
  }

  private async assertEnrolled(
    studentId: string,
    assignment: AssignmentWithCourse,
  ): Promise<void> {
    const isEnrolled = await this.enrollmentService.isEnrolled(
      studentId,
      assignment.lesson.module.courseId,
    );
    if (!isEnrolled) {
      throw new ApiException(
        403,
        'AUTH_003',
        'You must be enrolled in this course to access this assignment',
      );
    }
  }
}
