import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { QueryEnrollmentsDto } from '../dto/query-enrollments.dto';
import { UpdateProgressDto } from '../dto/update-progress.dto';
import { EnrollmentService } from '../services/enrollment.service';

@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STUDENT')
export class EnrollmentsController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Get('me')
  findMine(
    @CurrentUser('id') studentId: string,
    @Query() query: QueryEnrollmentsDto,
  ) {
    return this.enrollmentService.findMyEnrollments(
      studentId,
      query.page,
      query.limit,
    );
  }

  @Patch(':id/progress')
  updateProgress(
    @CurrentUser('id') studentId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.enrollmentService.updateProgress(studentId, id, dto);
  }
}
