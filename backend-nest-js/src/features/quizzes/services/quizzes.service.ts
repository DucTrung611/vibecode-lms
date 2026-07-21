import { Injectable, Logger } from '@nestjs/common';
import { AiClientService } from '../../../core/ai/ai-client.service';
import { ApiException } from '../../../shared/types/api-error-code.type';
import { CoursesService } from '../../courses/services/courses.service';
import { EnrollmentService } from '../../enrollment/services/enrollment.service';
import { GenerateQuizDto } from '../dto/generate-quiz.dto';
import { SubmitAttemptDto } from '../dto/submit-attempt.dto';
import { GeneratedQuizEntity } from '../entities/generated-quiz.entity';
import { QuizAttemptEntity } from '../entities/quiz-attempt.entity';
import { QuizEntity } from '../entities/quiz.entity';
import { QuizAttemptRepository } from '../repositories/quiz-attempt.repository';
import {
  QuizRepository,
  QuizWithQuestions,
} from '../repositories/quiz.repository';
import { parseGeneratedQuiz } from '../utils/parse-generated-quiz.util';
import { buildQuizGenerationPrompt } from '../utils/quiz-prompt.util';
import { gradeAttempt } from '../utils/scoring.util';

const DEFAULT_QUESTION_COUNT = 5;
const DEFAULT_PASS_SCORE = 70;

@Injectable()
export class QuizzesService {
  private readonly logger = new Logger(QuizzesService.name);

  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly quizAttemptRepository: QuizAttemptRepository,
    private readonly coursesService: CoursesService,
    private readonly enrollmentService: EnrollmentService,
    private readonly aiClient: AiClientService,
  ) {}

  async findById(studentId: string, quizId: string): Promise<QuizEntity> {
    const quiz = await this.getQuizOrThrow(quizId);
    await this.assertEnrolled(studentId, quiz);
    return QuizEntity.fromPrisma(quiz);
  }

  async startAttempt(
    studentId: string,
    quizId: string,
  ): Promise<QuizAttemptEntity> {
    const quiz = await this.getQuizOrThrow(quizId);
    await this.assertEnrolled(studentId, quiz);

    const attempt = await this.quizAttemptRepository.create({
      quizId: quiz.id,
      studentId,
    });

    this.logger.log(
      `Student ${studentId} started attempt ${attempt.id} on quiz ${quiz.id}`,
    );
    return QuizAttemptEntity.fromPrisma(attempt);
  }

  async submitAttempt(
    studentId: string,
    attemptId: string,
    dto: SubmitAttemptDto,
  ) {
    const attempt = await this.quizAttemptRepository.findById(attemptId);
    if (!attempt) {
      throw new ApiException(404, 'QUIZ_003', 'Attempt not found');
    }
    if (attempt.studentId !== studentId) {
      throw new ApiException(
        403,
        'AUTH_003',
        'This attempt does not belong to you',
      );
    }
    if (attempt.submittedAt) {
      throw new ApiException(409, 'QUIZ_002', 'Attempt already submitted');
    }

    const quiz = await this.getQuizOrThrow(attempt.quizId);
    const result = gradeAttempt(quiz.questions, dto.answers, quiz.passScore);

    const answersById = new Map(
      dto.answers.map((answer) => [answer.questionId, answer]),
    );
    await this.quizAttemptRepository.submit(attempt.id, {
      score: result.score,
      answers: result.answers.map((graded) => ({
        ...graded,
        selectedOptionId: answersById.get(graded.questionId)?.selectedOptionId,
        answerText: answersById.get(graded.questionId)?.answerText,
      })),
    });

    this.logger.log(
      `Attempt ${attempt.id} submitted with score ${result.score}`,
    );

    return {
      attemptId: attempt.id,
      score: result.score,
      passed: result.passed,
      answers: result.answers.map((answer) => ({
        questionId: answer.questionId,
        isCorrect: answer.isCorrect,
      })),
    };
  }

  async generateFromLesson(
    instructorId: string,
    lessonId: string,
    dto: GenerateQuizDto,
  ): Promise<GeneratedQuizEntity> {
    const courseId = await this.coursesService.findCourseIdByLessonId(lessonId);
    const course = await this.coursesService.findById(courseId);
    if (course.instructorId !== instructorId) {
      throw new ApiException(403, 'AUTH_003', 'You do not own this course');
    }

    const lesson = await this.coursesService.findLessonById(lessonId);
    const questionCount = dto.questionCount ?? DEFAULT_QUESTION_COUNT;

    const raw = await this.aiClient.complete([
      {
        role: 'system',
        content:
          'You are an assistant that writes multiple-choice quiz questions strictly as JSON, with no prose or markdown.',
      },
      {
        role: 'user',
        content: buildQuizGenerationPrompt(lesson, questionCount),
      },
    ]);
    const questions = parseGeneratedQuiz(raw);

    const quiz = await this.quizRepository.createGenerated({
      lessonId,
      title: `${lesson.title} — Quiz`,
      passScore: DEFAULT_PASS_SCORE,
      questions,
    });

    this.logger.log(`AI-generated quiz ${quiz.id} for lesson ${lessonId}`);
    return GeneratedQuizEntity.fromPrisma(quiz);
  }

  private async getQuizOrThrow(quizId: string): Promise<QuizWithQuestions> {
    const quiz = await this.quizRepository.findByIdWithQuestions(quizId);
    if (!quiz) {
      throw new ApiException(404, 'QUIZ_001', 'Quiz not found');
    }
    return quiz;
  }

  private async assertEnrolled(
    studentId: string,
    quiz: QuizWithQuestions,
  ): Promise<void> {
    if (!quiz.lessonId) {
      // Quizzes not tied to a lesson have no course to check enrollment
      // against; any authenticated student may access them.
      return;
    }

    const courseId = await this.coursesService.findCourseIdByLessonId(
      quiz.lessonId,
    );
    const isEnrolled = await this.enrollmentService.isEnrolled(
      studentId,
      courseId,
    );
    if (!isEnrolled) {
      throw new ApiException(
        403,
        'AUTH_003',
        'You must be enrolled in this course to access this quiz',
      );
    }
  }
}
