import { Injectable } from '@nestjs/common';
import { CoursesService } from '../../courses/services/courses.service';
import { ApiException } from '../../../shared/types/api-error-code.type';
import { AnalyticsRepository } from '../repositories/analytics.repository';
import {
  CourseAnalyticsDetail,
  CourseAnalyticsSummary,
  InstructorOverview,
} from '../types/analytics.types';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly coursesService: CoursesService,
  ) {}

  async getCourseAnalytics(
    instructorId: string,
    courseId: string,
  ): Promise<CourseAnalyticsDetail> {
    const course = await this.coursesService.findById(courseId);
    if (course.instructorId !== instructorId) {
      throw new ApiException(403, 'AUTH_003', 'You do not own this course');
    }

    const [summary, averageQuizScore] = await Promise.all([
      this.buildSummary(course.id, course.title),
      this.analyticsRepository.avgQuizScore(course.id),
    ]);

    return { ...summary, averageQuizScore };
  }

  async getOverview(instructorId: string): Promise<InstructorOverview> {
    const ownedCourses = await this.analyticsRepository.findInstructorCourses(instructorId);
    const courses = await Promise.all(
      ownedCourses.map((course) => this.buildSummary(course.id, course.title)),
    );

    const totals = courses.reduce(
      (acc, course) => ({
        totalCourses: acc.totalCourses + 1,
        totalStudents: acc.totalStudents + course.enrolledCount,
        totalRevenue: acc.totalRevenue + course.revenue,
        ratingSum: acc.ratingSum + (course.averageRating ?? 0) * course.reviewCount,
        reviewCount: acc.reviewCount + course.reviewCount,
      }),
      { totalCourses: 0, totalStudents: 0, totalRevenue: 0, ratingSum: 0, reviewCount: 0 },
    );

    return {
      totals: {
        totalCourses: totals.totalCourses,
        totalStudents: totals.totalStudents,
        totalRevenue: totals.totalRevenue,
        averageRating: totals.reviewCount > 0 ? totals.ratingSum / totals.reviewCount : null,
      },
      courses,
    };
  }

  private async buildSummary(courseId: string, title: string): Promise<CourseAnalyticsSummary> {
    const [enrolledCount, completedCount, revenue, rating] = await Promise.all([
      this.analyticsRepository.countEnrollments(courseId),
      this.analyticsRepository.countCompletedEnrollments(courseId),
      this.analyticsRepository.sumRevenue(courseId),
      this.analyticsRepository.ratingSummary(courseId),
    ]);

    return {
      id: courseId,
      title,
      enrolledCount,
      completionRate: enrolledCount > 0 ? completedCount / enrolledCount : 0,
      revenue,
      averageRating: rating.average,
      reviewCount: rating.count,
    };
  }
}
