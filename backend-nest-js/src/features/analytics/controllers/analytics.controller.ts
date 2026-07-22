import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { AnalyticsService } from '../services/analytics.service';

@Controller('instructor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('INSTRUCTOR')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('analytics/overview')
  getOverview(@CurrentUser('id') instructorId: string) {
    return this.analyticsService.getOverview(instructorId);
  }

  @Get('courses/:id/analytics')
  getCourseAnalytics(
    @CurrentUser('id') instructorId: string,
    @Param('id') courseId: string,
  ) {
    return this.analyticsService.getCourseAnalytics(instructorId, courseId);
  }
}
