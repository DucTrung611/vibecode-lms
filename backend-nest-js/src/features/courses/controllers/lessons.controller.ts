import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { UpdateLessonDto } from '../dto/update-lesson.dto';
import { CoursesService } from '../services/courses.service';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly coursesService: CoursesService) {}

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('INSTRUCTOR')
  update(
    @CurrentUser('id') instructorId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLessonDto,
  ) {
    return this.coursesService.updateLesson(instructorId, id, dto);
  }
}
