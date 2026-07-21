import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { ReviewsController } from './controllers/reviews.controller';
import { ReviewRepository } from './repositories/review.repository';
import { ReviewsService } from './services/reviews.service';

@Module({
  imports: [CoursesModule, EnrollmentModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewRepository],
  exports: [ReviewsService],
})
export class ReviewsModule {}
