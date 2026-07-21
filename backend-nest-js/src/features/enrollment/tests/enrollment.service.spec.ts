import { Enrollment } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CoursesService } from '../../courses/services/courses.service';
import { PaymentsService } from '../../payments/services/payments.service';
import { ENROLLMENT_COMPLETED_EVENT } from '../../../shared/events/enrollment-completed.event';
import { ApiException } from '../../../shared/types/api-error-code.type';
import { EnrollmentRepository } from '../repositories/enrollment.repository';
import { LessonProgressRepository } from '../repositories/lesson-progress.repository';
import { EnrollmentService } from '../services/enrollment.service';

describe('EnrollmentService', () => {
  let service: EnrollmentService;
  let enrollmentRepository: jest.Mocked<
    Pick<
      EnrollmentRepository,
      | 'findByStudentAndCourse'
      | 'findById'
      | 'findByStudent'
      | 'create'
      | 'markCompleted'
    >
  >;
  let lessonProgressRepository: jest.Mocked<
    Pick<LessonProgressRepository, 'upsert' | 'findCompletedLessonIds'>
  >;
  let coursesService: jest.Mocked<Pick<CoursesService, 'findById'>>;
  let eventEmitter: jest.Mocked<Pick<EventEmitter2, 'emit'>>;
  let paymentsService: jest.Mocked<
    Pick<PaymentsService, 'hasPaidOrderForCourse'>
  >;

  const fakeEnrollment: Enrollment = {
    id: 'enr_1',
    studentId: 'student_1',
    courseId: 'course_1',
    status: 'ACTIVE',
    enrolledAt: new Date('2026-01-01'),
    completedAt: null,
  };

  const courseWithLessons = (price = 0) => ({
    id: 'course_1',
    price,
    modules: [
      {
        id: 'module_1',
        lessons: [{ id: 'lesson_1' }, { id: 'lesson_2' }],
      },
    ],
  });

  beforeEach(() => {
    enrollmentRepository = {
      findByStudentAndCourse: jest.fn(),
      findById: jest.fn(),
      findByStudent: jest.fn(),
      create: jest.fn(),
      markCompleted: jest.fn(),
    };
    lessonProgressRepository = {
      upsert: jest.fn(),
      findCompletedLessonIds: jest.fn(),
    };
    coursesService = {
      findById: jest.fn(),
    };
    eventEmitter = {
      emit: jest.fn(),
    };
    paymentsService = {
      hasPaidOrderForCourse: jest.fn(),
    };

    service = new EnrollmentService(
      enrollmentRepository as unknown as EnrollmentRepository,
      lessonProgressRepository as unknown as LessonProgressRepository,
      coursesService as unknown as CoursesService,
      eventEmitter as unknown as EventEmitter2,
      paymentsService as unknown as PaymentsService,
    );
  });

  describe('enroll', () => {
    it('propagates COURSE_004 when the course does not exist', async () => {
      coursesService.findById.mockRejectedValue(
        new ApiException(404, 'COURSE_004', 'Course not found'),
      );

      await expect(
        service.enroll('student_1', 'missing'),
      ).rejects.toMatchObject({ httpStatus: 404, code: 'COURSE_004' });
      expect(enrollmentRepository.create).not.toHaveBeenCalled();
    });

    it('throws ENROLLMENT_001 (409) when already enrolled', async () => {
      coursesService.findById.mockResolvedValue(courseWithLessons(0) as never);
      enrollmentRepository.findByStudentAndCourse.mockResolvedValue(
        fakeEnrollment,
      );

      await expect(
        service.enroll('student_1', 'course_1'),
      ).rejects.toMatchObject({ httpStatus: 409, code: 'ENROLLMENT_001' });
      expect(enrollmentRepository.create).not.toHaveBeenCalled();
    });

    it('throws PAYMENT_001 (402) when the course is paid and no paid order exists', async () => {
      coursesService.findById.mockResolvedValue(
        courseWithLessons(49.99) as never,
      );
      enrollmentRepository.findByStudentAndCourse.mockResolvedValue(null);
      paymentsService.hasPaidOrderForCourse.mockResolvedValue(false);

      await expect(
        service.enroll('student_1', 'course_1'),
      ).rejects.toMatchObject({ httpStatus: 402, code: 'PAYMENT_001' });
      expect(paymentsService.hasPaidOrderForCourse).toHaveBeenCalledWith(
        'student_1',
        'course_1',
      );
      expect(enrollmentRepository.create).not.toHaveBeenCalled();
    });

    it('creates the enrollment for a paid course when a paid order exists', async () => {
      coursesService.findById.mockResolvedValue(
        courseWithLessons(49.99) as never,
      );
      enrollmentRepository.findByStudentAndCourse.mockResolvedValue(null);
      paymentsService.hasPaidOrderForCourse.mockResolvedValue(true);
      enrollmentRepository.create.mockResolvedValue(fakeEnrollment);

      const result = await service.enroll('student_1', 'course_1');

      expect(enrollmentRepository.create).toHaveBeenCalledWith({
        studentId: 'student_1',
        courseId: 'course_1',
      });
      expect(result.id).toBe('enr_1');
    });

    it('creates the enrollment for a free course', async () => {
      coursesService.findById.mockResolvedValue(courseWithLessons(0) as never);
      enrollmentRepository.findByStudentAndCourse.mockResolvedValue(null);
      enrollmentRepository.create.mockResolvedValue(fakeEnrollment);

      const result = await service.enroll('student_1', 'course_1');

      expect(enrollmentRepository.create).toHaveBeenCalledWith({
        studentId: 'student_1',
        courseId: 'course_1',
      });
      expect(result.id).toBe('enr_1');
    });
  });

  describe('findMyEnrollments', () => {
    it('normalizes pagination defaults and maps results', async () => {
      enrollmentRepository.findByStudent.mockResolvedValue({
        items: [fakeEnrollment],
        total: 1,
      } as never);

      const result = await service.findMyEnrollments('student_1');

      expect(enrollmentRepository.findByStudent).toHaveBeenCalledWith(
        'student_1',
        1,
        20,
      );
      expect(result.meta).toEqual({ page: 1, limit: 20, total: 1 });
      expect(result.items[0].id).toBe('enr_1');
    });

    it('forwards explicit page/limit', async () => {
      enrollmentRepository.findByStudent.mockResolvedValue({
        items: [],
        total: 0,
      });

      await service.findMyEnrollments('student_1', 3, 5);

      expect(enrollmentRepository.findByStudent).toHaveBeenCalledWith(
        'student_1',
        3,
        5,
      );
    });
  });

  describe('updateProgress', () => {
    const dto = { lessonId: 'lesson_1', status: 'COMPLETED' as const };

    it('throws ENROLLMENT_002 (404) when the enrollment does not exist', async () => {
      enrollmentRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateProgress('student_1', 'missing', dto),
      ).rejects.toMatchObject({ httpStatus: 404, code: 'ENROLLMENT_002' });
    });

    it('throws AUTH_003 (403) when the enrollment belongs to another student', async () => {
      enrollmentRepository.findById.mockResolvedValue(fakeEnrollment);

      await expect(
        service.updateProgress('someone_else', 'enr_1', dto),
      ).rejects.toMatchObject({ httpStatus: 403, code: 'AUTH_003' });
    });

    it('throws ENROLLMENT_003 (404) when the lesson does not belong to the course', async () => {
      enrollmentRepository.findById.mockResolvedValue(fakeEnrollment);
      coursesService.findById.mockResolvedValue(courseWithLessons() as never);

      await expect(
        service.updateProgress('student_1', 'enr_1', {
          lessonId: 'not-in-course',
        }),
      ).rejects.toMatchObject({ httpStatus: 404, code: 'ENROLLMENT_003' });
      expect(lessonProgressRepository.upsert).not.toHaveBeenCalled();
    });

    it('sets completedAt when status is COMPLETED', async () => {
      enrollmentRepository.findById.mockResolvedValue(fakeEnrollment);
      coursesService.findById.mockResolvedValue(courseWithLessons() as never);
      lessonProgressRepository.upsert.mockResolvedValue({
        id: 'progress_1',
        enrollmentId: 'enr_1',
        lessonId: 'lesson_1',
        status: 'COMPLETED',
        watchedSeconds: 0,
        completedAt: new Date(),
      } as never);
      lessonProgressRepository.findCompletedLessonIds.mockResolvedValue([
        'lesson_1',
      ]);

      await service.updateProgress('student_1', 'enr_1', dto);

      expect(lessonProgressRepository.upsert).toHaveBeenCalledWith(
        'enr_1',
        'lesson_1',
        expect.objectContaining({
          status: 'COMPLETED',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          completedAt: expect.any(Date),
        }),
      );
    });

    it('resets completedAt to null when status is set but not COMPLETED', async () => {
      enrollmentRepository.findById.mockResolvedValue(fakeEnrollment);
      coursesService.findById.mockResolvedValue(courseWithLessons() as never);
      lessonProgressRepository.upsert.mockResolvedValue({
        id: 'progress_1',
      } as never);
      lessonProgressRepository.findCompletedLessonIds.mockResolvedValue([]);

      await service.updateProgress('student_1', 'enr_1', {
        lessonId: 'lesson_1',
        status: 'IN_PROGRESS',
      });

      expect(lessonProgressRepository.upsert).toHaveBeenCalledWith(
        'enr_1',
        'lesson_1',
        expect.objectContaining({ status: 'IN_PROGRESS', completedAt: null }),
      );
    });

    it('leaves completedAt untouched when status is omitted', async () => {
      enrollmentRepository.findById.mockResolvedValue(fakeEnrollment);
      coursesService.findById.mockResolvedValue(courseWithLessons() as never);
      lessonProgressRepository.upsert.mockResolvedValue({
        id: 'progress_1',
      } as never);
      lessonProgressRepository.findCompletedLessonIds.mockResolvedValue([]);

      await service.updateProgress('student_1', 'enr_1', {
        lessonId: 'lesson_1',
        watchedSeconds: 30,
      });

      expect(lessonProgressRepository.upsert).toHaveBeenCalledWith(
        'enr_1',
        'lesson_1',
        expect.objectContaining({ completedAt: undefined }),
      );
    });

    it('marks the enrollment completed once every lesson is completed', async () => {
      enrollmentRepository.findById.mockResolvedValue(fakeEnrollment);
      coursesService.findById.mockResolvedValue(courseWithLessons() as never);
      lessonProgressRepository.upsert.mockResolvedValue({
        id: 'progress_1',
      } as never);
      lessonProgressRepository.findCompletedLessonIds.mockResolvedValue([
        'lesson_1',
        'lesson_2',
      ]);

      await service.updateProgress('student_1', 'enr_1', dto);

      expect(enrollmentRepository.markCompleted).toHaveBeenCalledWith('enr_1');
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        ENROLLMENT_COMPLETED_EVENT,
        {
          enrollmentId: 'enr_1',
          studentId: 'student_1',
          courseId: 'course_1',
        },
      );
    });

    it('does not re-mark or re-emit when the enrollment is already COMPLETED', async () => {
      enrollmentRepository.findById.mockResolvedValue({
        ...fakeEnrollment,
        status: 'COMPLETED',
      });
      coursesService.findById.mockResolvedValue(courseWithLessons() as never);
      lessonProgressRepository.upsert.mockResolvedValue({
        id: 'progress_1',
      } as never);

      await service.updateProgress('student_1', 'enr_1', dto);

      expect(
        lessonProgressRepository.findCompletedLessonIds,
      ).not.toHaveBeenCalled();
      expect(enrollmentRepository.markCompleted).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('does not mark the enrollment completed while lessons remain incomplete', async () => {
      enrollmentRepository.findById.mockResolvedValue(fakeEnrollment);
      coursesService.findById.mockResolvedValue(courseWithLessons() as never);
      lessonProgressRepository.upsert.mockResolvedValue({
        id: 'progress_1',
      } as never);
      lessonProgressRepository.findCompletedLessonIds.mockResolvedValue([
        'lesson_1',
      ]);

      await service.updateProgress('student_1', 'enr_1', dto);

      expect(enrollmentRepository.markCompleted).not.toHaveBeenCalled();
    });

    it('does not attempt completion when the course has no lessons', async () => {
      enrollmentRepository.findById.mockResolvedValue(fakeEnrollment);
      coursesService.findById.mockResolvedValue({
        id: 'course_1',
        price: 0,
        modules: [],
      } as never);

      await expect(
        service.updateProgress('student_1', 'enr_1', dto),
      ).rejects.toMatchObject({ httpStatus: 404, code: 'ENROLLMENT_003' });
      expect(
        lessonProgressRepository.findCompletedLessonIds,
      ).not.toHaveBeenCalled();
    });
  });
});
