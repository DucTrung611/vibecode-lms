import { AssignmentSubmission } from '@prisma/client';
import { CoursesService } from '../../courses/services/courses.service';
import { EnrollmentService } from '../../enrollment/services/enrollment.service';
import { CreateSubmissionDto } from '../dto/create-submission.dto';
import { GradeSubmissionDto } from '../dto/grade-submission.dto';
import { AssignmentSubmissionRepository } from '../repositories/assignment-submission.repository';
import {
  AssignmentRepository,
  AssignmentWithCourse,
} from '../repositories/assignment.repository';
import { AssignmentsService } from '../services/assignments.service';

describe('AssignmentsService', () => {
  let service: AssignmentsService;
  let assignmentRepository: jest.Mocked<
    Pick<AssignmentRepository, 'findByIdWithCourse'>
  >;
  let submissionRepository: jest.Mocked<
    Pick<
      AssignmentSubmissionRepository,
      | 'findById'
      | 'findByAssignmentAndStudent'
      | 'create'
      | 'grade'
      | 'findByAssignment'
    >
  >;
  let coursesService: jest.Mocked<Pick<CoursesService, 'findById'>>;
  let enrollmentService: jest.Mocked<Pick<EnrollmentService, 'isEnrolled'>>;

  const assignment: AssignmentWithCourse = {
    id: 'asg_1',
    lessonId: 'lesson_1',
    title: 'Essay',
    description: 'Write an essay',
    dueDate: null,
    maxScore: 100,
    lesson: { module: { courseId: 'course_1' } },
  };

  const fakeSubmission: AssignmentSubmission = {
    id: 'sub_1',
    assignmentId: 'asg_1',
    studentId: 'student_1',
    fileUrl: null,
    content: 'my essay',
    submittedAt: new Date('2026-01-01'),
    score: null,
    feedback: null,
    gradedById: null,
    gradedAt: null,
  };

  beforeEach(() => {
    assignmentRepository = { findByIdWithCourse: jest.fn() };
    submissionRepository = {
      findById: jest.fn(),
      findByAssignmentAndStudent: jest.fn(),
      create: jest.fn(),
      grade: jest.fn(),
      findByAssignment: jest.fn(),
    };
    coursesService = { findById: jest.fn() };
    enrollmentService = { isEnrolled: jest.fn() };

    service = new AssignmentsService(
      assignmentRepository as unknown as AssignmentRepository,
      submissionRepository as unknown as AssignmentSubmissionRepository,
      coursesService as unknown as CoursesService,
      enrollmentService as unknown as EnrollmentService,
    );
  });

  describe('findById', () => {
    it('throws ASSIGNMENT_001 (404) when the assignment does not exist', async () => {
      assignmentRepository.findByIdWithCourse.mockResolvedValue(null);

      await expect(
        service.findById('student_1', 'missing'),
      ).rejects.toMatchObject({
        httpStatus: 404,
        code: 'ASSIGNMENT_001',
      });
    });

    it('throws AUTH_003 (403) when the student is not enrolled', async () => {
      assignmentRepository.findByIdWithCourse.mockResolvedValue(assignment);
      enrollmentService.isEnrolled.mockResolvedValue(false);

      await expect(
        service.findById('student_1', 'asg_1'),
      ).rejects.toMatchObject({
        httpStatus: 403,
        code: 'AUTH_003',
      });
    });

    it('returns the assignment when enrolled', async () => {
      assignmentRepository.findByIdWithCourse.mockResolvedValue(assignment);
      enrollmentService.isEnrolled.mockResolvedValue(true);

      const result = await service.findById('student_1', 'asg_1');

      expect(enrollmentService.isEnrolled).toHaveBeenCalledWith(
        'student_1',
        'course_1',
      );
      expect(result.id).toBe('asg_1');
    });
  });

  describe('submit', () => {
    const dto: CreateSubmissionDto = { content: 'my essay' };

    it('throws ASSIGNMENT_001 (404) when the assignment does not exist', async () => {
      assignmentRepository.findByIdWithCourse.mockResolvedValue(null);

      await expect(
        service.submit('student_1', 'missing', dto),
      ).rejects.toMatchObject({ httpStatus: 404, code: 'ASSIGNMENT_001' });
    });

    it('throws AUTH_003 (403) when not enrolled', async () => {
      assignmentRepository.findByIdWithCourse.mockResolvedValue(assignment);
      enrollmentService.isEnrolled.mockResolvedValue(false);

      await expect(
        service.submit('student_1', 'asg_1', dto),
      ).rejects.toMatchObject({ httpStatus: 403, code: 'AUTH_003' });
    });

    it('throws ASSIGNMENT_005 (400) when neither fileUrl nor content is given', async () => {
      assignmentRepository.findByIdWithCourse.mockResolvedValue(assignment);
      enrollmentService.isEnrolled.mockResolvedValue(true);

      await expect(
        service.submit('student_1', 'asg_1', {}),
      ).rejects.toMatchObject({ httpStatus: 400, code: 'ASSIGNMENT_005' });
      expect(submissionRepository.create).not.toHaveBeenCalled();
    });

    it('throws ASSIGNMENT_002 (409) when already submitted', async () => {
      assignmentRepository.findByIdWithCourse.mockResolvedValue(assignment);
      enrollmentService.isEnrolled.mockResolvedValue(true);
      submissionRepository.findByAssignmentAndStudent.mockResolvedValue(
        fakeSubmission,
      );

      await expect(
        service.submit('student_1', 'asg_1', dto),
      ).rejects.toMatchObject({ httpStatus: 409, code: 'ASSIGNMENT_002' });
      expect(submissionRepository.create).not.toHaveBeenCalled();
    });

    it('throws ASSIGNMENT_003 (400) when past the due date', async () => {
      assignmentRepository.findByIdWithCourse.mockResolvedValue({
        ...assignment,
        dueDate: new Date('2020-01-01'),
      });
      enrollmentService.isEnrolled.mockResolvedValue(true);
      submissionRepository.findByAssignmentAndStudent.mockResolvedValue(null);

      await expect(
        service.submit('student_1', 'asg_1', dto),
      ).rejects.toMatchObject({ httpStatus: 400, code: 'ASSIGNMENT_003' });
      expect(submissionRepository.create).not.toHaveBeenCalled();
    });

    it('creates the submission when everything checks out', async () => {
      assignmentRepository.findByIdWithCourse.mockResolvedValue(assignment);
      enrollmentService.isEnrolled.mockResolvedValue(true);
      submissionRepository.findByAssignmentAndStudent.mockResolvedValue(null);
      submissionRepository.create.mockResolvedValue(fakeSubmission);

      const result = await service.submit('student_1', 'asg_1', dto);

      expect(submissionRepository.create).toHaveBeenCalledWith({
        assignmentId: 'asg_1',
        studentId: 'student_1',
        fileUrl: undefined,
        content: 'my essay',
      });
      expect(result.id).toBe('sub_1');
    });
  });

  describe('gradeSubmission', () => {
    const dto: GradeSubmissionDto = { score: 90, feedback: 'Nice' };

    it('throws ASSIGNMENT_004 (404) when the submission does not exist', async () => {
      submissionRepository.findById.mockResolvedValue(null);

      await expect(
        service.gradeSubmission('instructor_1', 'missing', dto),
      ).rejects.toMatchObject({ httpStatus: 404, code: 'ASSIGNMENT_004' });
    });

    it('throws AUTH_003 (403) when the grader does not own the course', async () => {
      submissionRepository.findById.mockResolvedValue(fakeSubmission);
      assignmentRepository.findByIdWithCourse.mockResolvedValue(assignment);
      coursesService.findById.mockResolvedValue({
        instructorId: 'someone_else',
      } as never);

      await expect(
        service.gradeSubmission('instructor_1', 'sub_1', dto),
      ).rejects.toMatchObject({ httpStatus: 403, code: 'AUTH_003' });
    });

    it('throws ASSIGNMENT_006 (400) when the score exceeds maxScore', async () => {
      submissionRepository.findById.mockResolvedValue(fakeSubmission);
      assignmentRepository.findByIdWithCourse.mockResolvedValue(assignment);
      coursesService.findById.mockResolvedValue({
        instructorId: 'instructor_1',
      } as never);

      await expect(
        service.gradeSubmission('instructor_1', 'sub_1', { score: 999 }),
      ).rejects.toMatchObject({ httpStatus: 400, code: 'ASSIGNMENT_006' });
      expect(submissionRepository.grade).not.toHaveBeenCalled();
    });

    it('grades the submission when the grader owns the course', async () => {
      submissionRepository.findById.mockResolvedValue(fakeSubmission);
      assignmentRepository.findByIdWithCourse.mockResolvedValue(assignment);
      coursesService.findById.mockResolvedValue({
        instructorId: 'instructor_1',
      } as never);
      submissionRepository.grade.mockResolvedValue({
        ...fakeSubmission,
        score: 90,
        feedback: 'Nice',
        gradedById: 'instructor_1',
        gradedAt: new Date(),
      });

      const result = await service.gradeSubmission(
        'instructor_1',
        'sub_1',
        dto,
      );

      expect(submissionRepository.grade).toHaveBeenCalledWith('sub_1', {
        score: 90,
        feedback: 'Nice',
        gradedById: 'instructor_1',
      });
      expect(result.score).toBe(90);
    });
  });

  describe('findSubmissions', () => {
    it('throws ASSIGNMENT_001 (404) when the assignment does not exist', async () => {
      assignmentRepository.findByIdWithCourse.mockResolvedValue(null);

      await expect(
        service.findSubmissions('instructor_1', 'missing'),
      ).rejects.toMatchObject({ httpStatus: 404, code: 'ASSIGNMENT_001' });
    });

    it('throws AUTH_003 (403) when the caller does not own the course', async () => {
      assignmentRepository.findByIdWithCourse.mockResolvedValue(assignment);
      coursesService.findById.mockResolvedValue({
        instructorId: 'someone_else',
      } as never);

      await expect(
        service.findSubmissions('instructor_1', 'asg_1'),
      ).rejects.toMatchObject({ httpStatus: 403, code: 'AUTH_003' });
      expect(submissionRepository.findByAssignment).not.toHaveBeenCalled();
    });

    it('returns the paginated, mapped submission list for the owning instructor', async () => {
      assignmentRepository.findByIdWithCourse.mockResolvedValue(assignment);
      coursesService.findById.mockResolvedValue({
        instructorId: 'instructor_1',
      } as never);
      submissionRepository.findByAssignment.mockResolvedValue({
        items: [
          {
            ...fakeSubmission,
            student: { id: 'student_1', fullName: 'Jane Doe' },
          },
        ],
        total: 1,
      });

      const result = await service.findSubmissions('instructor_1', 'asg_1');

      expect(submissionRepository.findByAssignment).toHaveBeenCalledWith(
        'asg_1',
        1,
        20,
      );
      expect(result.meta).toEqual({ page: 1, limit: 20, total: 1 });
      expect(result.items[0].student).toEqual({
        id: 'student_1',
        fullName: 'Jane Doe',
      });
    });
  });
});
