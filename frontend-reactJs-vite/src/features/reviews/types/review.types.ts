import { z } from 'zod';

export interface ReviewStudentSummary {
  id: string;
  fullName: string;
}

export interface Review {
  id: string;
  courseId: string;
  studentId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  student?: ReviewStudentSummary;
}

export interface CreateReviewPayload {
  rating: number;
  comment?: string;
}

export const reviewFormSchema = z.object({
  rating: z.number().min(1, 'Pick a rating').max(5),
  comment: z.string().optional(),
});
export type ReviewFormValues = z.infer<typeof reviewFormSchema>;
