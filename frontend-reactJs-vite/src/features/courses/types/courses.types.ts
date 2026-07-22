import { z } from 'zod';

export const COURSE_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
export type CourseLevel = (typeof COURSE_LEVELS)[number];

export const COURSE_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export type CourseStatus = (typeof COURSE_STATUSES)[number];

export const LESSON_TYPES = ['VIDEO', 'TEXT', 'QUIZ', 'ASSIGNMENT'] as const;
export type LessonType = (typeof LESSON_TYPES)[number];

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  type: LessonType;
  videoUrl: string | null;
  content: string | null;
  durationSec: number | null;
  order: number;
  quizId: string | null;
  assignmentId: string | null;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons?: Lesson[];
}

export interface CourseInstructorSummary {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string | null;
  price: number;
  level: CourseLevel;
  status: CourseStatus;
  instructorId: string;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
  modules?: CourseModule[];
  instructor?: CourseInstructorSummary;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

export interface CourseListFilters {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'price' | 'title';
  order?: 'asc' | 'desc';
  status?: CourseStatus;
  categoryId?: string;
  level?: CourseLevel;
  search?: string;
}

export const courseFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  thumbnailUrl: z
    .union([z.string().url('Enter a valid URL'), z.literal('')])
    .optional(),
  price: z.number().min(0, 'Price cannot be negative'),
  level: z.enum(COURSE_LEVELS),
  categoryId: z.string().optional(),
});
export type CourseFormValues = z.infer<typeof courseFormSchema>;

export const updateCourseFormSchema = courseFormSchema.extend({
  status: z.enum(COURSE_STATUSES),
});
export type UpdateCourseFormValues = z.infer<typeof updateCourseFormSchema>;

export const moduleFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
});
export type ModuleFormValues = z.infer<typeof moduleFormSchema>;

export const lessonFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(LESSON_TYPES),
  videoUrl: z
    .union([z.string().url('Enter a valid URL'), z.literal('')])
    .optional(),
  content: z.string().optional(),
  durationSec: z.number().min(0).optional(),
});
export type LessonFormValues = z.infer<typeof lessonFormSchema>;
