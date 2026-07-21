import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';
import { PaymentsModule } from '../payments/payments.module';
import { EnrollController } from './controllers/enroll.controller';
import { EnrollmentsController } from './controllers/enrollments.controller';
import { EnrollmentRepository } from './repositories/enrollment.repository';
import { LessonProgressRepository } from './repositories/lesson-progress.repository';
import { EnrollmentService } from './services/enrollment.service';

@Module({
  imports: [CoursesModule, PaymentsModule],
  controllers: [EnrollController, EnrollmentsController],
  providers: [
    EnrollmentService,
    EnrollmentRepository,
    LessonProgressRepository,
  ],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
