import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { QueryLearningPathsDto } from '../dto/query-learning-paths.dto';
import { LearningPathsService } from '../services/learning-paths.service';

@Controller('learning-paths')
export class LearningPathsController {
  constructor(private readonly learningPathsService: LearningPathsService) {}

  @Get()
  findAll(@Query() query: QueryLearningPathsDto) {
    return this.learningPathsService.findAll(query.page, query.limit);
  }

  @Post(':id/enroll')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  enroll(@CurrentUser('id') studentId: string, @Param('id') id: string) {
    return this.learningPathsService.enroll(studentId, id);
  }
}
