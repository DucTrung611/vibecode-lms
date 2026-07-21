import { z } from 'zod';

export interface Assignment {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  dueDate: string | null;
  maxScore: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  fileUrl: string | null;
  content: string | null;
  submittedAt: string;
  score: number | null;
  feedback: string | null;
  gradedById: string | null;
  gradedAt: string | null;
  student?: { id: string; fullName: string };
}

export interface CreateSubmissionPayload {
  fileUrl?: string;
  content?: string;
}

export interface GradeSubmissionPayload {
  score: number;
  feedback?: string;
}

export const submissionFormSchema = z
  .object({
    fileUrl: z
      .union([z.string().url('Enter a valid URL'), z.literal('')])
      .optional(),
    content: z.string().optional(),
  })
  .refine((data) => Boolean(data.fileUrl) || Boolean(data.content), {
    message: 'Provide a file URL or written content',
    path: ['content'],
  });
export type SubmissionFormValues = z.infer<typeof submissionFormSchema>;

export const gradeFormSchema = z.object({
  score: z.number().min(0, 'Score cannot be negative'),
  feedback: z.string().optional(),
});
export type GradeFormValues = z.infer<typeof gradeFormSchema>;
