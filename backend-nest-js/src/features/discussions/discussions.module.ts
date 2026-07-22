import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { LessonQuestionsController } from './controllers/lesson-questions.controller';
import { QuestionAnswersController } from './controllers/question-answers.controller';
import { DiscussionRepository } from './repositories/discussion.repository';
import { DiscussionsService } from './services/discussions.service';

@Module({
  imports: [CoursesModule, EnrollmentModule],
  controllers: [LessonQuestionsController, QuestionAnswersController],
  providers: [DiscussionsService, DiscussionRepository],
  exports: [DiscussionsService],
})
export class DiscussionsModule {}
