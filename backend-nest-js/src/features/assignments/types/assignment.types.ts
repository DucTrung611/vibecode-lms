export interface CreateSubmissionInput {
  fileUrl?: string;
  content?: string;
}

export interface GradeSubmissionInput {
  score: number;
  feedback?: string;
}
