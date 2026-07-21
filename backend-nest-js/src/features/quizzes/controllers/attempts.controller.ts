import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { SubmitAttemptDto } from '../dto/submit-attempt.dto';
import { QuizzesService } from '../services/quizzes.service';

@Controller('attempts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STUDENT')
export class AttemptsController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post(':id/submit')
  submit(
    @CurrentUser('id') studentId: string,
    @Param('id') id: string,
    @Body() dto: SubmitAttemptDto,
  ) {
    return this.quizzesService.submitAttempt(studentId, id, dto);
  }
}
