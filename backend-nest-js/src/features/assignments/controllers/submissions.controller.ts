import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { GradeSubmissionDto } from '../dto/grade-submission.dto';
import { AssignmentsService } from '../services/assignments.service';

@Controller('submissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('INSTRUCTOR')
export class SubmissionsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Patch(':id/grade')
  grade(
    @CurrentUser('id') graderId: string,
    @Param('id') id: string,
    @Body() dto: GradeSubmissionDto,
  ) {
    return this.assignmentsService.gradeSubmission(graderId, id, dto);
  }
}
