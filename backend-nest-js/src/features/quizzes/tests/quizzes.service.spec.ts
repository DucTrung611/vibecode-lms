import { QuizAttempt } from '@prisma/client';
import { AiClientService } from '../../../core/ai/ai-client.service';
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
    Pick<QuizRepository, 'findByIdWithQuestions' | 'createGenerated'>
  >;
  let quizAttemptRepository: jest.Mocked<
    Pick<QuizAttemptRepository, 'findById' | 'create' | 'submit'>
  >;
  let coursesService: jest.Mocked<
    Pick<
      CoursesService,
      'findCourseIdByLessonId' | 'findById' | 'findLessonById'
    >
  >;
  let enrollmentService: jest.Mocked<Pick<EnrollmentService, 'isEnrolled'>>;
  let aiClient: jest.Mocked<Pick<AiClientService, 'complete'>>;

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
    quizRepository = {
      findByIdWithQuestions: jest.fn(),
      createGenerated: jest.fn(),
    };
    quizAttemptRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      submit: jest.fn(),
    };
    coursesService = {
      findCourseIdByLessonId: jest.fn(),
      findById: jest.fn(),
      findLessonById: jest.fn(),
    };
    enrollmentService = { isEnrolled: jest.fn() };
    aiClient = { complete: jest.fn() };

    service = new QuizzesService(
      quizRepository as unknown as QuizRepository,
      quizAttemptRepository as unknown as QuizAttemptRepository,
      coursesService as unknown as CoursesService,
      enrollmentService as unknown as EnrollmentService,
      aiClient as unknown as AiClientService,
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

  describe('generateFromLesson', () => {
    const lesson = {
      id: 'lesson_1',
      title: 'Right Triangles',
      content: 'A right triangle has one 90-degree angle.',
    };
    const validAiJson = JSON.stringify({
      questions: [
        {
          type: 'SINGLE_CHOICE',
          content: 'How many right angles does a right triangle have?',
          points: 10,
          options: [
            { content: '1', isCorrect: true },
            { content: '2', isCorrect: false },
          ],
        },
      ],
    });

    it('throws AUTH_003 (403) when the instructor does not own the course', async () => {
      coursesService.findCourseIdByLessonId.mockResolvedValue('course_1');
      coursesService.findById.mockResolvedValue({
        instructorId: 'someone_else',
      } as never);

      await expect(
        service.generateFromLesson('instructor_1', 'lesson_1', {}),
      ).rejects.toMatchObject({ httpStatus: 403, code: 'AUTH_003' });
      expect(aiClient.complete).not.toHaveBeenCalled();
    });

    it('generates and persists a quiz from the AI response', async () => {
      coursesService.findCourseIdByLessonId.mockResolvedValue('course_1');
      coursesService.findById.mockResolvedValue({
        instructorId: 'instructor_1',
      } as never);
      coursesService.findLessonById.mockResolvedValue(lesson as never);
      aiClient.complete.mockResolvedValue(validAiJson);
      quizRepository.createGenerated.mockResolvedValue({
        id: 'quiz_generated_1',
        lessonId: 'lesson_1',
        title: 'Right Triangles — Quiz',
        isAiGenerated: true,
        passScore: 70,
        timeLimitSec: null,
        questions: [
          {
            id: 'q_1',
            quizId: 'quiz_generated_1',
            type: 'SINGLE_CHOICE',
            content: 'How many right angles does a right triangle have?',
            points: 10,
            order: 0,
            options: [
              {
                id: 'opt_1',
                questionId: 'q_1',
                content: '1',
                isCorrect: true,
              },
              {
                id: 'opt_2',
                questionId: 'q_1',
                content: '2',
                isCorrect: false,
              },
            ],
          },
        ],
      } as never);

      const result = await service.generateFromLesson(
        'instructor_1',
        'lesson_1',
        { questionCount: 1 },
      );

      expect(aiClient.complete).toHaveBeenCalledWith([
        expect.objectContaining({ role: 'system' }) as unknown,
        expect.objectContaining({
          role: 'user',
          content: expect.stringContaining('Right Triangles') as string,
        }) as unknown,
      ]);
      expect(quizRepository.createGenerated).toHaveBeenCalledWith({
        lessonId: 'lesson_1',
        title: 'Right Triangles — Quiz',
        passScore: 70,
        questions: [
          {
            type: 'SINGLE_CHOICE',
            content: 'How many right angles does a right triangle have?',
            points: 10,
            options: [
              { content: '1', isCorrect: true },
              { content: '2', isCorrect: false },
            ],
          },
        ],
      });
      expect(result.id).toBe('quiz_generated_1');
      expect(result.questions[0].options[0].isCorrect).toBe(true);
    });

    it('propagates QUIZ_004 (502) when the AI response is not valid JSON', async () => {
      coursesService.findCourseIdByLessonId.mockResolvedValue('course_1');
      coursesService.findById.mockResolvedValue({
        instructorId: 'instructor_1',
      } as never);
      coursesService.findLessonById.mockResolvedValue(lesson as never);
      aiClient.complete.mockResolvedValue('not json at all');

      await expect(
        service.generateFromLesson('instructor_1', 'lesson_1', {}),
      ).rejects.toMatchObject({ httpStatus: 502, code: 'QUIZ_004' });
      expect(quizRepository.createGenerated).not.toHaveBeenCalled();
    });
  });
});
