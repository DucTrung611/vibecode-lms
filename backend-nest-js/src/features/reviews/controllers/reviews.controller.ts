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
import { CreateReviewDto } from '../dto/create-review.dto';
import { QueryReviewsDto } from '../dto/query-reviews.dto';
import { ReviewsService } from '../services/reviews.service';

@Controller('courses')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get(':id/reviews')
  findByCourse(@Param('id') courseId: string, @Query() query: QueryReviewsDto) {
    return this.reviewsService.findByCourse(courseId, query.page, query.limit);
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  create(
    @CurrentUser('id') studentId: string,
    @Param('id') courseId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(studentId, courseId, dto);
  }
}
