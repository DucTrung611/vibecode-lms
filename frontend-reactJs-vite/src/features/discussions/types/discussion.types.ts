import { z } from 'zod';

export interface QuestionStudentSummary {
  id: string;
  fullName: string;
}

export interface AnswerAuthorSummary {
  id: string;
  fullName: string;
  role: string;
}

export interface LessonAnswer {
  id: string;
  questionId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author?: AnswerAuthorSummary;
}

export interface LessonQuestion {
  id: string;
  lessonId: string;
  studentId: string;
  content: string;
  createdAt: string;
  student?: QuestionStudentSummary;
  answers?: LessonAnswer[];
}

export interface CreateQuestionPayload {
  content: string;
}

export interface CreateAnswerPayload {
  content: string;
}

export const questionFormSchema = z.object({
  content: z.string().min(1, 'Write your question before submitting'),
});
export type QuestionFormValues = z.infer<typeof questionFormSchema>;

export const answerFormSchema = z.object({
  content: z.string().min(1, 'Write your answer before submitting'),
});
export type AnswerFormValues = z.infer<typeof answerFormSchema>;
