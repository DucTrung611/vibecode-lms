import { ApiException } from '../../../shared/types/api-error-code.type';
import { CoursesService } from '../../courses/services/courses.service';
import { UserEntity } from '../../identity/entities/user.entity';
import { UsersService } from '../../identity/services/users.service';
import { InstructorRepository } from '../repositories/instructor.repository';
import { InstructorsService } from '../services/instructors.service';

describe('InstructorsService', () => {
  let service: InstructorsService;
  let instructorRepository: jest.Mocked<
    Pick<
      InstructorRepository,
      'findPublishedCourseIds' | 'countDistinctStudents' | 'ratingSummary'
    >
  >;
  let usersService: jest.Mocked<Pick<UsersService, 'findById'>>;
  let coursesService: jest.Mocked<Pick<CoursesService, 'findPublishedByInstructor'>>;

  const instructorUser = {
    id: 'instructor_1',
    fullName: 'Prof X',
    avatarUrl: null,
    bio: 'Teaches things.',
    role: 'INSTRUCTOR',
  } as UserEntity;

  const studentUser = {
    id: 'student_1',
    fullName: 'Jane Doe',
    avatarUrl: null,
    bio: null,
    role: 'STUDENT',
  } as UserEntity;

  beforeEach(() => {
    instructorRepository = {
      findPublishedCourseIds: jest.fn(),
      countDistinctStudents: jest.fn(),
      ratingSummary: jest.fn(),
    };
    usersService = { findById: jest.fn() };
    coursesService = { findPublishedByInstructor: jest.fn() };

    service = new InstructorsService(
      instructorRepository as unknown as InstructorRepository,
      usersService as unknown as UsersService,
      coursesService as unknown as CoursesService,
    );
  });

  describe('getProfile', () => {
    it('propagates AUTH_007 (404) when the user does not exist', async () => {
      usersService.findById.mockRejectedValue(
        new ApiException(404, 'AUTH_007', 'User not found'),
      );

      await expect(service.getProfile('missing')).rejects.toMatchObject({
        httpStatus: 404,
        code: 'AUTH_007',
      });
      expect(instructorRepository.findPublishedCourseIds).not.toHaveBeenCalled();
    });

    it('throws AUTH_007 (404) when the user exists but is not an instructor', async () => {
      usersService.findById.mockResolvedValue(studentUser);

      await expect(service.getProfile('student_1')).rejects.toMatchObject({
        httpStatus: 404,
        code: 'AUTH_007',
      });
      expect(instructorRepository.findPublishedCourseIds).not.toHaveBeenCalled();
    });

    it('returns zeroed stats for an instructor with no published courses', async () => {
      usersService.findById.mockResolvedValue(instructorUser);
      instructorRepository.findPublishedCourseIds.mockResolvedValue([]);
      instructorRepository.countDistinctStudents.mockResolvedValue(0);
      instructorRepository.ratingSummary.mockResolvedValue({
        average: null,
        count: 0,
      });

      const result = await service.getProfile('instructor_1');

      expect(result).toEqual({
        id: 'instructor_1',
        fullName: 'Prof X',
        avatarUrl: null,
        bio: 'Teaches things.',
        stats: {
          totalCourses: 0,
          totalStudents: 0,
          averageRating: null,
          reviewCount: 0,
        },
      });
    });

    it('assembles profile and stats for an instructor with published courses', async () => {
      usersService.findById.mockResolvedValue(instructorUser);
      instructorRepository.findPublishedCourseIds.mockResolvedValue([
        'course_1',
        'course_2',
      ]);
      instructorRepository.countDistinctStudents.mockResolvedValue(15);
      instructorRepository.ratingSummary.mockResolvedValue({
        average: 4.6,
        count: 5,
      });

      const result = await service.getProfile('instructor_1');

      expect(instructorRepository.countDistinctStudents).toHaveBeenCalledWith([
        'course_1',
        'course_2',
      ]);
      expect(instructorRepository.ratingSummary).toHaveBeenCalledWith([
        'course_1',
        'course_2',
      ]);
      expect(result.stats).toEqual({
        totalCourses: 2,
        totalStudents: 15,
        averageRating: 4.6,
        reviewCount: 5,
      });
    });
  });

  describe('getCourses', () => {
    it('propagates AUTH_007 (404) when the user does not exist', async () => {
      usersService.findById.mockRejectedValue(
        new ApiException(404, 'AUTH_007', 'User not found'),
      );

      await expect(
        service.getCourses('missing', 1, 20),
      ).rejects.toMatchObject({ httpStatus: 404, code: 'AUTH_007' });
      expect(coursesService.findPublishedByInstructor).not.toHaveBeenCalled();
    });

    it('throws AUTH_007 (404) when the user exists but is not an instructor', async () => {
      usersService.findById.mockResolvedValue(studentUser);

      await expect(
        service.getCourses('student_1', 1, 20),
      ).rejects.toMatchObject({ httpStatus: 404, code: 'AUTH_007' });
      expect(coursesService.findPublishedByInstructor).not.toHaveBeenCalled();
    });

    it('verifies the instructor then delegates to coursesService', async () => {
      usersService.findById.mockResolvedValue(instructorUser);
      coursesService.findPublishedByInstructor.mockResolvedValue({
        items: [],
        meta: { page: 1, limit: 20, total: 0 },
      });

      const result = await service.getCourses('instructor_1', 1, 20);

      expect(coursesService.findPublishedByInstructor).toHaveBeenCalledWith(
        'instructor_1',
        1,
        20,
      );
      expect(result.meta).toEqual({ page: 1, limit: 20, total: 0 });
    });
  });
});
