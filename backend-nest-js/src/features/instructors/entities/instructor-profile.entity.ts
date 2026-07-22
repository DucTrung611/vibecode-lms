export interface InstructorStats {
  totalCourses: number;
  totalStudents: number;
  averageRating: number | null;
  reviewCount: number;
}

export class InstructorProfileEntity {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  stats: InstructorStats;
}
