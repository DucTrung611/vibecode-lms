import { QuizAttempt } from '@prisma/client';
import { CoursesService } from '../../courses/services/courses.service';
import { EnrollmentService } from '../../enrollment/services/enrollment.service';
import { SubmitAttemptDto } from '../dto/submit-attempt.dto';
import { QuizAttemptRepository } from '../repositories/quiz-attempt.repository';
import {
  QuizRepository,
  QuizWithQuestions,
} from '../repositories/quiz.repository';
import { QuizzesService } from '../services/quizzes.service';

describe('QuizzesService', () => {
  let service: QuizzesService;
  let quizRepository: jest.Mocked<
    Pick<QuizRepository, 'findByIdWithQuestions'>
  >;
  let quizAttemptRepository: jest.Mocked<
    Pick<QuizAttemptRepository, 'findById' | 'create' | 'submit'>
  >;
  let coursesService: jest.Mocked<
    Pick<CoursesService, 'findCourseIdByLessonId'>
  >;
  let enrollmentService: jest.Mocked<Pick<EnrollmentService, 'isEnrolled'>>;

  const quizWithLesson: QuizWithQuestions = {
    id: 'quiz_1',
    lessonId: 'lesson_1',
    title: 'Algebra Basics',
    isAiGenerated: false,
    passScore: 50,
    timeLimitSec: null,
    lesson: { module: { courseId: 'course_1' } },
    questions: [
      {
        id: 'q_1',
        quizId: 'quiz_1',
        type: 'SINGLE_CHOICE',
        content: '2+2?',
        points: 10,
        order: 0,
        options: [
          { id: 'opt_1', questionId: 'q_1', content: '3', isCorrect: false },
          { id: 'opt_2', questionId: 'q_1', content: '4', isCorrect: true },
        ],
      },
    ],
  } as unknown as QuizWithQuestions;

  const quizWithoutLesson: QuizWithQuestions = {
    ...quizWithLesson,
    lessonId: null,
    lesson: null,
  };

  const fakeAttempt: QuizAttempt = {
    id: 'att_1',
    quizId: 'quiz_1',
    studentId: 'student_1',
    score: null,
    startedAt: new Date('2026-01-01'),
    submittedAt: null,
  };

  beforeEach(() => {
    quizRepository = { findByIdWithQuestions: jest.fn() };
    quizAttemptRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      submit: jest.fn(),
    };
    coursesService = { findCourseIdByLessonId: jest.fn() };
    enrollmentService = { isEnrolled: jest.fn() };

    service = new QuizzesService(
      quizRepository as unknown as QuizRepository,
      quizAttemptRepository as unknown as QuizAttemptRepository,
      coursesService as unknown as CoursesService,
      enrollmentService as unknown as EnrollmentService,
    );
  });

  describe('findById', () => {
    it('throws QUIZ_001 (404) when the quiz does not exist', async () => {
      quizRepository.findByIdWithQuestions.mockResolvedValue(null);

      await expect(
        service.findById('student_1', 'missing'),
      ).rejects.toMatchObject({
        httpStatus: 404,
        code: 'QUIZ_001',
      });
    });

    it('throws AUTH_003 (403) when the student is not enrolled in the quiz course', async () => {
      quizRepository.findByIdWithQuestions.mockResolvedValue(quizWithLesson);
      coursesService.findCourseIdByLessonId.mockResolvedValue('course_1');
      enrollmentService.isEnrolled.mockResolvedValue(false);

      await expect(
        service.findById('student_1', 'quiz_1'),
      ).rejects.toMatchObject({
        httpStatus: 403,
        code: 'AUTH_003',
      });
    });

    it('returns the quiz with options but without isCorrect when enrolled', async () => {
      quizRepository.findByIdWithQuestions.mockResolvedValue(quizWithLesson);
      coursesService.findCourseIdByLessonId.mockResolvedValue('course_1');
      enrollmentService.isEnrolled.mockResolvedValue(true);

      const result = await service.findById('student_1', 'quiz_1');

      expect(result.id).toBe('quiz_1');
      expect(result.questions?.[0].options?.[0]).not.toHaveProperty(
        'isCorrect',
      );
    });

    it('skips the enrollment check when the quiz has no lessonId', async () => {
      quizRepository.findByIdWithQuestions.mockResolvedValue(quizWithoutLesson);

      const result = await service.findById('student_1', 'quiz_1');

      expect(coursesService.findCourseIdByLessonId).not.toHaveBeenCalled();
      expect(enrollmentService.isEnrolled).not.toHaveBeenCalled();
      expect(result.id).toBe('quiz_1');
    });
  });

  describe('startAttempt', () => {
    it('creates an attempt when the student is enrolled', async () => {
      quizRepository.findByIdWithQuestions.mockResolvedValue(quizWithLesson);
      coursesService.findCourseIdByLessonId.mockResolvedValue('course_1');
      enrollmentService.isEnrolled.mockResolvedValue(true);
      quizAttemptRepository.create.mockResolvedValue(fakeAttempt);

      const result = await service.startAttempt('student_1', 'quiz_1');

      expect(quizAttemptRepository.create).toHaveBeenCalledWith({
        quizId: 'quiz_1',
        studentId: 'student_1',
      });
      expect(result.id).toBe('att_1');
    });

    it('throws AUTH_003 (403) when not enrolled, without creating an attempt', async () => {
      quizRepository.findByIdWithQuestions.mockResolvedValue(quizWithLesson);
      coursesService.findCourseIdByLessonId.mockResolvedValue('course_1');
      enrollmentService.isEnrolled.mockResolvedValue(false);

      await expect(
        service.startAttempt('student_1', 'quiz_1'),
      ).rejects.toMatchObject({
        httpStatus: 403,
        code: 'AUTH_003',
      });
      expect(quizAttemptRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('submitAttempt', () => {
    const dto: SubmitAttemptDto = {
      answers: [{ questionId: 'q_1', selectedOptionId: 'opt_2' }],
    };

    it('throws QUIZ_003 (404) when the attempt does not exist', async () => {
      quizAttemptRepository.findById.mockResolvedValue(null);

      await expect(
        service.submitAttempt('student_1', 'missing', dto),
      ).rejects.toMatchObject({ httpStatus: 404, code: 'QUIZ_003' });
    });

    it('throws AUTH_003 (403) when the attempt belongs to another student', async () => {
      quizAttemptRepository.findById.mockResolvedValue(fakeAttempt);

      await expect(
        service.submitAttempt('someone_else', 'att_1', dto),
      ).rejects.toMatchObject({ httpStatus: 403, code: 'AUTH_003' });
    });

    it('throws QUIZ_002 (409) when the attempt was already submitted', async () => {
      quizAttemptRepository.findById.mockResolvedValue({
        ...fakeAttempt,
        submittedAt: new Date(),
      });

      await expect(
        service.submitAttempt('student_1', 'att_1', dto),
      ).rejects.toMatchObject({ httpStatus: 409, code: 'QUIZ_002' });
    });

    it('grades the answers, persists the result, and returns the score/passed shape', async () => {
      quizAttemptRepository.findById.mockResolvedValue(fakeAttempt);
      quizRepository.findByIdWithQuestions.mockResolvedValue(quizWithLesson);
      quizAttemptRepository.submit.mockResolvedValue({
        ...fakeAttempt,
        score: 100,
        submittedAt: new Date(),
      });

      const result = await service.submitAttempt('student_1', 'att_1', dto);

      expect(quizAttemptRepository.submit).toHaveBeenCalledWith('att_1', {
        score: 100,
        answers: [
          {
            questionId: 'q_1',
            isCorrect: true,
            pointsEarned: 10,
            selectedOptionId: 'opt_2',
            answerText: undefined,
          },
        ],
      });
      expect(result).toEqual({
        attemptId: 'att_1',
        score: 100,
        passed: true,
        answers: [{ questionId: 'q_1', isCorrect: true }],
      });
    });
  });
});
