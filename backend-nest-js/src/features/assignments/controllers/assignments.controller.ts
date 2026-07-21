import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { CreateSubmissionDto } from '../dto/create-submission.dto';
import { QuerySubmissionsDto } from '../dto/query-submissions.dto';
import { AssignmentsService } from '../services/assignments.service';

@Controller('assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STUDENT')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get(':id')
  findOne(@CurrentUser('id') studentId: string, @Param('id') id: string) {
    return this.assignmentsService.findById(studentId, id);
  }

  @Post(':id/submissions')
  submit(
    @CurrentUser('id') studentId: string,
    @Param('id') id: string,
    @Body() dto: CreateSubmissionDto,
  ) {
    return this.assignmentsService.submit(studentId, id, dto);
  }

  @Get(':id/submissions')
  @Roles('INSTRUCTOR')
  findSubmissions(
    @CurrentUser('id') instructorId: string,
    @Param('id') id: string,
    @Query() query: QuerySubmissionsDto,
  ) {
    return this.assignmentsService.findSubmissions(
      instructorId,
      id,
      query.page,
      query.limit,
    );
  }
}
