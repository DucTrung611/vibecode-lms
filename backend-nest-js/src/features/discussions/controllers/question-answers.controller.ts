import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { CreateLessonAnswerDto } from '../dto/create-lesson-answer.dto';
import { DiscussionsService } from '../services/discussions.service';

@Controller('questions')
export class QuestionAnswersController {
  constructor(private readonly discussionsService: DiscussionsService) {}

  @Post(':id/answers')
  @UseGuards(JwtAuthGuard)
  createAnswer(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
    @Param('id') questionId: string,
    @Body() dto: CreateLessonAnswerDto,
  ) {
    return this.discussionsService.createAnswer(userId, userRole, questionId, dto);
  }
}
