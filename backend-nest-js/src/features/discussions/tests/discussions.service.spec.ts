import { LessonAnswer, LessonQuestion } from '@prisma/client';
import { CoursesService } from '../../courses/services/courses.service';
import { EnrollmentService } from '../../enrollment/services/enrollment.service';
import { CreateLessonAnswerDto } from '../dto/create-lesson-answer.dto';
import { CreateLessonQuestionDto } from '../dto/create-lesson-question.dto';
import { DiscussionRepository } from '../repositories/discussion.repository';
import { DiscussionsService } from '../services/discussions.service';

describe('DiscussionsService', () => {
  let service: DiscussionsService;
  let discussionRepository: jest.Mocked<
    Pick<
      DiscussionRepository,
      'findByLessonWithAnswers' | 'findQuestionById' | 'createQuestion' | 'createAnswer'
    >
  >;
  let coursesService: jest.Mocked<
    Pick<CoursesService, 'findCourseIdByLessonId' | 'findById'>
  >;
  let enrollmentService: jest.Mocked<Pick<EnrollmentService, 'isEnrolled'>>;

  const fakeQuestion = {
    id: 'question_1',
    lessonId: 'lesson_1',
  } as LessonQuestion;
  const fakeAnswer = { id: 'answer_1' } as LessonAnswer;

  beforeEach(() => {
    discussionRepository = {
      findByLessonWithAnswers: jest.fn(),
      findQuestionById: jest.fn(),
      createQuestion: jest.fn(),
      createAnswer: jest.fn(),
    };
    coursesService = {
      findCourseIdByLessonId: jest.fn(),
      findById: jest.fn(),
    };
    enrollmentService = { isEnrolled: jest.fn() };

    service = new DiscussionsService(
      discussionRepository as unknown as DiscussionRepository,
      coursesService as unknown as CoursesService,
      enrollmentService as unknown as EnrollmentService,
    );
  });

  describe('findByLesson', () => {
    it('throws AUTH_003 (403) when a student is not enrolled', async () => {
      coursesService.findCourseIdByLessonId.mockResolvedValue('course_1');
      enrollmentService.isEnrolled.mockResolvedValue(false);

      await expect(
        service.findByLesson('student_1', 'STUDENT', 'lesson_1'),
      ).rejects.toMatchObject({ httpStatus: 403, code: 'AUTH_003' });
      expect(discussionRepository.findByLessonWithAnswers).not.toHaveBeenCalled();
    });

    it('throws AUTH_003 (403) when an instructor does not own the course', async () => {
      coursesService.findCourseIdByLessonId.mockResolvedValue('course_1');
      coursesService.findById.mockResolvedValue({
        id: 'course_1',
        instructorId: 'other_instructor',
      } as never);

      await expect(
        service.findByLesson('instructor_1', 'INSTRUCTOR', 'lesson_1'),
      ).rejects.toMatchObject({ httpStatus: 403, code: 'AUTH_003' });
      expect(discussionRepository.findByLessonWithAnswers).not.toHaveBeenCalled();
    });

    it('lists questions and normalizes pagination for an enrolled student', async () => {
      coursesService.findCourseIdByLessonId.mockResolvedValue('course_1');
      enrollmentService.isEnrolled.mockResolvedValue(true);
      discussionRepository.findByLessonWithAnswers.mockResolvedValue({
        items: [fakeQuestion],
        total: 1,
      } as never);

      const result = await service.findByLesson('student_1', 'STUDENT', 'lesson_1');

      expect(discussionRepository.findByLessonWithAnswers).toHaveBeenCalledWith(
        'lesson_1',
        1,
        20,
      );
      expect(result.meta).toEqual({ page: 1, limit: 20, total: 1 });
      expect(result.items[0].id).toBe('question_1');
    });

    it('allows the owning instructor without an enrollment check', async () => {
      coursesService.findCourseIdByLessonId.mockResolvedValue('course_1');
      coursesService.findById.mockResolvedValue({
        id: 'course_1',
        instructorId: 'instructor_1',
      } as never);
      discussionRepository.findByLessonWithAnswers.mockResolvedValue({
        items: [],
        total: 0,
      });

      await service.findByLesson('instructor_1', 'INSTRUCTOR', 'lesson_1');

      expect(enrollmentService.isEnrolled).not.toHaveBeenCalled();
    });
  });

  describe('createQuestion', () => {
    const dto: CreateLessonQuestionDto = { content: 'How does this work?' };

    it('throws AUTH_003 (403) when the student is not enrolled', async () => {
      coursesService.findCourseIdByLessonId.mockResolvedValue('course_1');
      enrollmentService.isEnrolled.mockResolvedValue(false);

      await expect(
        service.createQuestion('student_1', 'lesson_1', dto),
      ).rejects.toMatchObject({ httpStatus: 403, code: 'AUTH_003' });
      expect(discussionRepository.createQuestion).not.toHaveBeenCalled();
    });

    it('creates the question when enrolled', async () => {
      coursesService.findCourseIdByLessonId.mockResolvedValue('course_1');
      enrollmentService.isEnrolled.mockResolvedValue(true);
      discussionRepository.createQuestion.mockResolvedValue(fakeQuestion);

      const result = await service.createQuestion('student_1', 'lesson_1', dto);

      expect(discussionRepository.createQuestion).toHaveBeenCalledWith({
        lessonId: 'lesson_1',
        studentId: 'student_1',
        content: 'How does this work?',
      });
      expect(result.id).toBe('question_1');
    });
  });

  describe('createAnswer', () => {
    const dto: CreateLessonAnswerDto = { content: 'Here is how.' };

    it('throws DISCUSSION_001 (404) when the question does not exist', async () => {
      discussionRepository.findQuestionById.mockResolvedValue(null);

      await expect(
        service.createAnswer('student_1', 'STUDENT', 'missing', dto),
      ).rejects.toMatchObject({ httpStatus: 404, code: 'DISCUSSION_001' });
      expect(discussionRepository.createAnswer).not.toHaveBeenCalled();
    });

    it('throws AUTH_003 (403) when a student is not enrolled', async () => {
      discussionRepository.findQuestionById.mockResolvedValue(fakeQuestion);
      coursesService.findCourseIdByLessonId.mockResolvedValue('course_1');
      enrollmentService.isEnrolled.mockResolvedValue(false);

      await expect(
        service.createAnswer('student_1', 'STUDENT', 'question_1', dto),
      ).rejects.toMatchObject({ httpStatus: 403, code: 'AUTH_003' });
      expect(discussionRepository.createAnswer).not.toHaveBeenCalled();
    });

    it('throws AUTH_003 (403) when an instructor does not own the course', async () => {
      discussionRepository.findQuestionById.mockResolvedValue(fakeQuestion);
      coursesService.findCourseIdByLessonId.mockResolvedValue('course_1');
      coursesService.findById.mockResolvedValue({
        id: 'course_1',
        instructorId: 'other_instructor',
      } as never);

      await expect(
        service.createAnswer('instructor_1', 'INSTRUCTOR', 'question_1', dto),
      ).rejects.toMatchObject({ httpStatus: 403, code: 'AUTH_003' });
      expect(discussionRepository.createAnswer).not.toHaveBeenCalled();
    });

    it('creates the answer for an enrolled student', async () => {
      discussionRepository.findQuestionById.mockResolvedValue(fakeQuestion);
      coursesService.findCourseIdByLessonId.mockResolvedValue('course_1');
      enrollmentService.isEnrolled.mockResolvedValue(true);
      discussionRepository.createAnswer.mockResolvedValue(fakeAnswer);

      const result = await service.createAnswer('student_1', 'STUDENT', 'question_1', dto);

      expect(discussionRepository.createAnswer).toHaveBeenCalledWith({
        questionId: 'question_1',
        authorId: 'student_1',
        content: 'Here is how.',
      });
      expect(result.id).toBe('answer_1');
    });

    it('creates the answer for the owning instructor', async () => {
      discussionRepository.findQuestionById.mockResolvedValue(fakeQuestion);
      coursesService.findCourseIdByLessonId.mockResolvedValue('course_1');
      coursesService.findById.mockResolvedValue({
        id: 'course_1',
        instructorId: 'instructor_1',
      } as never);
      discussionRepository.createAnswer.mockResolvedValue(fakeAnswer);

      const result = await service.createAnswer('instructor_1', 'INSTRUCTOR', 'question_1', dto);

      expect(enrollmentService.isEnrolled).not.toHaveBeenCalled();
      expect(result.id).toBe('answer_1');
    });
  });
});
