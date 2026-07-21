import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { CreateLessonDto } from '../dto/create-lesson.dto';
import { CoursesService } from '../services/courses.service';

@Controller('modules')
export class ModulesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post(':id/lessons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('INSTRUCTOR')
  addLesson(
    @CurrentUser('id') instructorId: string,
    @Param('id') id: string,
    @Body() dto: CreateLessonDto,
  ) {
    return this.coursesService.addLesson(instructorId, id, dto);
  }
}
