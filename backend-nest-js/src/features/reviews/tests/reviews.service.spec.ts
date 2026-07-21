import { Review } from '@prisma/client';
import { CoursesService } from '../../courses/services/courses.service';
import { EnrollmentService } from '../../enrollment/services/enrollment.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { ReviewRepository } from '../repositories/review.repository';
import { ReviewsService } from '../services/reviews.service';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewRepository: jest.Mocked<
    Pick<ReviewRepository, 'findByStudentAndCourse' | 'findByCourse' | 'create'>
  >;
  let coursesService: jest.Mocked<Pick<CoursesService, 'findById'>>;
  let enrollmentService: jest.Mocked<Pick<EnrollmentService, 'isEnrolled'>>;

  const fakeReview: Review = {
    id: 'rev_1',
    courseId: 'course_1',
    studentId: 'student_1',
    rating: 5,
    comment: 'Great course',
    createdAt: new Date('2026-01-01'),
  };

  beforeEach(() => {
    reviewRepository = {
      findByStudentAndCourse: jest.fn(),
      findByCourse: jest.fn(),
      create: jest.fn(),
    };
    coursesService = { findById: jest.fn() };
    enrollmentService = { isEnrolled: jest.fn() };

    service = new ReviewsService(
      reviewRepository as unknown as ReviewRepository,
      coursesService as unknown as CoursesService,
      enrollmentService as unknown as EnrollmentService,
    );
  });

  describe('findByCourse', () => {
    it('propagates COURSE_004 when the course does not exist', async () => {
      coursesService.findById.mockRejectedValue(
        Object.assign(new Error('Course not found'), {
          httpStatus: 404,
          code: 'COURSE_004',
        }),
      );

      await expect(service.findByCourse('missing')).rejects.toMatchObject({
        httpStatus: 404,
        code: 'COURSE_004',
      });
      expect(reviewRepository.findByCourse).not.toHaveBeenCalled();
    });

    it('normalizes pagination defaults and maps results', async () => {
      coursesService.findById.mockResolvedValue({ id: 'course_1' } as never);
      reviewRepository.findByCourse.mockResolvedValue({
        items: [fakeReview],
        total: 1,
      });

      const result = await service.findByCourse('course_1');

      expect(reviewRepository.findByCourse).toHaveBeenCalledWith(
        'course_1',
        1,
        20,
      );
      expect(result.meta).toEqual({ page: 1, limit: 20, total: 1 });
      expect(result.items[0].id).toBe('rev_1');
    });
  });

  describe('create', () => {
    const dto: CreateReviewDto = { rating: 5, comment: 'Great course' };

    it('throws AUTH_003 (403) when the student is not enrolled', async () => {
      coursesService.findById.mockResolvedValue({ id: 'course_1' } as never);
      enrollmentService.isEnrolled.mockResolvedValue(false);

      await expect(
        service.create('student_1', 'course_1', dto),
      ).rejects.toMatchObject({ httpStatus: 403, code: 'AUTH_003' });
      expect(reviewRepository.create).not.toHaveBeenCalled();
    });

    it('throws REVIEW_001 (409) when already reviewed', async () => {
      coursesService.findById.mockResolvedValue({ id: 'course_1' } as never);
      enrollmentService.isEnrolled.mockResolvedValue(true);
      reviewRepository.findByStudentAndCourse.mockResolvedValue(fakeReview);

      await expect(
        service.create('student_1', 'course_1', dto),
      ).rejects.toMatchObject({ httpStatus: 409, code: 'REVIEW_001' });
      expect(reviewRepository.create).not.toHaveBeenCalled();
    });

    it('creates the review when enrolled and not yet reviewed', async () => {
      coursesService.findById.mockResolvedValue({ id: 'course_1' } as never);
      enrollmentService.isEnrolled.mockResolvedValue(true);
      reviewRepository.findByStudentAndCourse.mockResolvedValue(null);
      reviewRepository.create.mockResolvedValue(fakeReview);

      const result = await service.create('student_1', 'course_1', dto);

      expect(reviewRepository.create).toHaveBeenCalledWith({
        courseId: 'course_1',
        studentId: 'student_1',
        rating: 5,
        comment: 'Great course',
      });
      expect(result.id).toBe('rev_1');
    });
  });
});
