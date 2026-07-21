export interface LearningPathItem {
  id: string;
  learningPathId: string;
  courseId: string;
  order: number;
  course?: { id: string; title: string; thumbnailUrl: string | null; price: number };
}

export interface LearningPath {
  id: string;
  title: string;
  description: string | null;
  createdById: string | null;
  isAiGenerated: boolean;
  items?: LearningPathItem[];
}

export interface LearningPathEnrollment {
  id: string;
  studentId: string;
  learningPathId: string;
  progressPercent: number;
  startedAt: string;
  completedAt: string | null;
}
