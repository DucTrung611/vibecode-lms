import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { GenerateQuizDto } from '../dto/generate-quiz.dto';
import { QuizzesService } from '../services/quizzes.service';

@Controller('lessons')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('INSTRUCTOR')
export class LessonQuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post(':id/quizzes/generate')
  generate(
    @CurrentUser('id') instructorId: string,
    @Param('id') lessonId: string,
    @Body() dto: GenerateQuizDto,
  ) {
    return this.quizzesService.generateFromLesson(instructorId, lessonId, dto);
  }
}
