import { Module } from '@nestjs/common';
import { CategoriesController } from './controllers/categories.controller';
import { CoursesController } from './controllers/courses.controller';
import { ModulesController } from './controllers/modules.controller';
import { CategoryRepository } from './repositories/category.repository';
import { CourseRepository } from './repositories/course.repository';
import { LessonRepository } from './repositories/lesson.repository';
import { ModuleRepository } from './repositories/module.repository';
import { CategoriesService } from './services/categories.service';
import { CoursesService } from './services/courses.service';

@Module({
  controllers: [CoursesController, ModulesController, CategoriesController],
  providers: [
    CoursesService,
    CourseRepository,
    ModuleRepository,
    LessonRepository,
    CategoriesService,
    CategoryRepository,
  ],
  exports: [CoursesService, CategoriesService],
})
export class CoursesModule {}
