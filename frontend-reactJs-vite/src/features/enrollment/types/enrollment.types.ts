export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type LessonProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface EnrollmentCourseSummary {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt: string | null;
  course?: EnrollmentCourseSummary;
}

export interface EnrollResponse {
  enrollmentId: string;
  status: EnrollmentStatus;
}

export interface LessonProgress {
  id: string;
  enrollmentId: string;
  lessonId: string;
  status: LessonProgressStatus;
  watchedSeconds: number;
  completedAt: string | null;
}

export interface UpdateProgressPayload {
  lessonId: string;
  status?: LessonProgressStatus;
  watchedSeconds?: number;
}
