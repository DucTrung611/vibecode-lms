export interface CourseAnalyticsSummary {
  id: string;
  title: string;
  enrolledCount: number;
  completionRate: number;
  revenue: number;
  averageRating: number | null;
  reviewCount: number;
}

export interface CourseAnalyticsDetail extends CourseAnalyticsSummary {
  averageQuizScore: number | null;
}

export interface InstructorAnalyticsTotals {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number | null;
}

export interface InstructorOverview {
  totals: InstructorAnalyticsTotals;
  courses: CourseAnalyticsSummary[];
}
