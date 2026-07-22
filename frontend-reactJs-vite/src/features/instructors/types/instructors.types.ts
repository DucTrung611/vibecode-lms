export interface InstructorStats {
  totalCourses: number;
  totalStudents: number;
  averageRating: number | null;
  reviewCount: number;
}

export interface InstructorProfile {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  stats: InstructorStats;
}
