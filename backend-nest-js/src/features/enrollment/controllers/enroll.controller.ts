import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { EnrollmentService } from '../services/enrollment.service';

@Controller('courses')
export class EnrollController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post(':id/enroll')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  async enroll(
    @CurrentUser('id') studentId: string,
    @Param('id') courseId: string,
  ) {
    const enrollment = await this.enrollmentService.enroll(studentId, courseId);
    return { enrollmentId: enrollment.id, status: enrollment.status };
  }
}
