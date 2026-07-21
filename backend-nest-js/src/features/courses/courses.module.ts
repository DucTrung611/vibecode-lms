import { Module } from '@nestjs/common';
import { CoursesController } from './controllers/courses.controller';
import { ModulesController } from './controllers/modules.controller';
import { CourseRepository } from './repositories/course.repository';
import { LessonRepository } from './repositories/lesson.repository';
import { ModuleRepository } from './repositories/module.repository';
import { CoursesService } from './services/courses.service';

@Module({
  controllers: [CoursesController, ModulesController],
  providers: [
    CoursesService,
    CourseRepository,
    ModuleRepository,
    LessonRepository,
  ],
  exports: [CoursesService],
})
export class CoursesModule {}
