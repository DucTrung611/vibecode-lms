import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { QuizzesService } from '../services/quizzes.service';

@Controller('quizzes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STUDENT')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get(':id')
  findOne(@CurrentUser('id') studentId: string, @Param('id') id: string) {
    return this.quizzesService.findById(studentId, id);
  }

  @Post(':id/attempts')
  startAttempt(@CurrentUser('id') studentId: string, @Param('id') id: string) {
    return this.quizzesService.startAttempt(studentId, id);
  }
}
