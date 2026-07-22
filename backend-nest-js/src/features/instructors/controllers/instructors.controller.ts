import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  normalizePagination,
} from '../../../shared/utils/pagination.util';
import { QueryInstructorCoursesDto } from '../dto/query-instructor-courses.dto';
import { InstructorsService } from '../services/instructors.service';

@Controller('instructors')
export class InstructorsController {
  constructor(private readonly instructorsService: InstructorsService) {}

  @Get(':id')
  getProfile(@Param('id') id: string) {
    return this.instructorsService.getProfile(id);
  }

  @Get(':id/courses')
  getCourses(
    @Param('id') id: string,
    @Query() query: QueryInstructorCoursesDto,
  ) {
    const { page, limit } = normalizePagination({
      page: query.page ?? DEFAULT_PAGE,
      limit: query.limit ?? DEFAULT_LIMIT,
    });
    return this.instructorsService.getCourses(id, page, limit);
  }
}
