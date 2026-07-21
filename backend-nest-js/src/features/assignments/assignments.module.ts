import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { AssignmentsController } from './controllers/assignments.controller';
import { SubmissionsController } from './controllers/submissions.controller';
import { AssignmentSubmissionRepository } from './repositories/assignment-submission.repository';
import { AssignmentRepository } from './repositories/assignment.repository';
import { AssignmentsService } from './services/assignments.service';

@Module({
  imports: [CoursesModule, EnrollmentModule],
  controllers: [AssignmentsController, SubmissionsController],
  providers: [
    AssignmentsService,
    AssignmentRepository,
    AssignmentSubmissionRepository,
  ],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
