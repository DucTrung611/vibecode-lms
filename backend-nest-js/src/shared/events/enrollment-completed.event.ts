export const ENROLLMENT_COMPLETED_EVENT = 'enrollment.completed';

export interface EnrollmentCompletedEvent {
  enrollmentId: string;
  studentId: string;
  courseId: string;
}
