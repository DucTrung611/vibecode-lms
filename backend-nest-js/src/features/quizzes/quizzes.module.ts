import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { AttemptsController } from './controllers/attempts.controller';
import { QuizzesController } from './controllers/quizzes.controller';
import { QuizAttemptRepository } from './repositories/quiz-attempt.repository';
import { QuizRepository } from './repositories/quiz.repository';
import { QuizzesService } from './services/quizzes.service';

@Module({
  imports: [CoursesModule, EnrollmentModule],
  controllers: [QuizzesController, AttemptsController],
  providers: [QuizzesService, QuizRepository, QuizAttemptRepository],
  exports: [QuizzesService],
})
export class QuizzesModule {}
