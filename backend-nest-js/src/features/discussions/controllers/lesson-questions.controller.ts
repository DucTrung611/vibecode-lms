import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { CreateLessonQuestionDto } from '../dto/create-lesson-question.dto';
import { QueryLessonQuestionsDto } from '../dto/query-lesson-questions.dto';
import { DiscussionsService } from '../services/discussions.service';

@Controller('lessons')
export class LessonQuestionsController {
  constructor(private readonly discussionsService: DiscussionsService) {}

  @Get(':id/questions')
  @UseGuards(JwtAuthGuard)
  findByLesson(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
    @Param('id') lessonId: string,
    @Query() query: QueryLessonQuestionsDto,
  ) {
    return this.discussionsService.findByLesson(
      userId,
      userRole,
      lessonId,
      query.page,
      query.limit,
    );
  }

  @Post(':id/questions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  createQuestion(
    @CurrentUser('id') studentId: string,
    @Param('id') lessonId: string,
    @Body() dto: CreateLessonQuestionDto,
  ) {
    return this.discussionsService.createQuestion(studentId, lessonId, dto);
  }
}
