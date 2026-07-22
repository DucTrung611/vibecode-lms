import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';
import { IdentityModule } from '../identity/identity.module';
import { InstructorsController } from './controllers/instructors.controller';
import { InstructorRepository } from './repositories/instructor.repository';
import { InstructorsService } from './services/instructors.service';

@Module({
  imports: [CoursesModule, IdentityModule],
  controllers: [InstructorsController],
  providers: [InstructorsService, InstructorRepository],
  exports: [InstructorsService],
})
export class InstructorsModule {}
