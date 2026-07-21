import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';
import { LearningPathsController } from './controllers/learning-paths.controller';
import { LearningPathEnrollmentRepository } from './repositories/learning-path-enrollment.repository';
import { LearningPathRepository } from './repositories/learning-path.repository';
import { LearningPathsService } from './services/learning-paths.service';

@Module({
  imports: [CoursesModule],
  controllers: [LearningPathsController],
  providers: [
    LearningPathsService,
    LearningPathRepository,
    LearningPathEnrollmentRepository,
  ],
  exports: [LearningPathsService],
})
export class LearningPathsModule {}
