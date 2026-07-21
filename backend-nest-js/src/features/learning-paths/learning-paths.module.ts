import { Module } from '@nestjs/common';
import { LearningPathsController } from './controllers/learning-paths.controller';
import { LearningPathEnrollmentRepository } from './repositories/learning-path-enrollment.repository';
import { LearningPathRepository } from './repositories/learning-path.repository';
import { LearningPathsService } from './services/learning-paths.service';

@Module({
  controllers: [LearningPathsController],
  providers: [
    LearningPathsService,
    LearningPathRepository,
    LearningPathEnrollmentRepository,
  ],
  exports: [LearningPathsService],
})
export class LearningPathsModule {}
