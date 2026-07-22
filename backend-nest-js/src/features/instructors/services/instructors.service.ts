import { Injectable } from '@nestjs/common';
import { ApiException } from '../../../shared/types/api-error-code.type';
import { PaginatedResult } from '../../../shared/types/paginated-result.type';
import { CourseEntity } from '../../courses/entities/course.entity';
import { CoursesService } from '../../courses/services/courses.service';
import { UserEntity } from '../../identity/entities/user.entity';
import { UsersService } from '../../identity/services/users.service';
import { InstructorProfileEntity } from '../entities/instructor-profile.entity';
import { InstructorRepository } from '../repositories/instructor.repository';

@Injectable()
export class InstructorsService {
  constructor(
    private readonly instructorRepository: InstructorRepository,
    private readonly usersService: UsersService,
    private readonly coursesService: CoursesService,
  ) {}

  async getProfile(instructorId: string): Promise<InstructorProfileEntity> {
    const instructor = await this.getVerifiedInstructor(instructorId);
    const courseIds =
      await this.instructorRepository.findPublishedCourseIds(instructorId);
    const [totalStudents, rating] = await Promise.all([
      this.instructorRepository.countDistinctStudents(courseIds),
      this.instructorRepository.ratingSummary(courseIds),
    ]);

    const profile = new InstructorProfileEntity();
    profile.id = instructor.id;
    profile.fullName = instructor.fullName;
    profile.avatarUrl = instructor.avatarUrl;
    profile.bio = instructor.bio;
    profile.stats = {
      totalCourses: courseIds.length,
      totalStudents,
      averageRating: rating.average,
      reviewCount: rating.count,
    };
    return profile;
  }

  async getCourses(
    instructorId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<CourseEntity>> {
    await this.getVerifiedInstructor(instructorId);
    return this.coursesService.findPublishedByInstructor(
      instructorId,
      page,
      limit,
    );
  }

  private async getVerifiedInstructor(
    instructorId: string,
  ): Promise<UserEntity> {
    const user = await this.usersService.findById(instructorId);
    if (user.role !== 'INSTRUCTOR') {
      throw new ApiException(404, 'AUTH_007', 'Instructor not found');
    }
    return user;
  }
}
