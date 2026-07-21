import { Question, QuestionOption } from '@prisma/client';
import { AnswerInput, GradedAnswer, ScoringResult } from '../types/quiz.types';

type QuestionWithOptions = Question & { options: QuestionOption[] };

export function gradeAttempt(
  questions: QuestionWithOptions[],
  answers: AnswerInput[],
  passScore: number,
): ScoringResult {
  const questionMap = new Map(
    questions.map((question) => [question.id, question]),
  );
  const totalPoints = questions.reduce(
    (sum, question) => sum + question.points,
    0,
  );

  const graded: GradedAnswer[] = answers.map((answer) =>
    gradeAnswer(questionMap.get(answer.questionId), answer),
  );

  const earnedPoints = graded.reduce(
    (sum, answer) => sum + answer.pointsEarned,
    0,
  );
  const score =
    totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = score >= passScore;

  return { answers: graded, score, passed };
}

function gradeAnswer(
  question: QuestionWithOptions | undefined,
  answer: AnswerInput,
): GradedAnswer {
  if (!question) {
    return { questionId: answer.questionId, isCorrect: false, pointsEarned: 0 };
  }

  // Free-text answers have no stored correct value to compare against;
  // auto-grading them is out of scope until manual/AI grading exists.
  if (question.type === 'TEXT') {
    return { questionId: question.id, isCorrect: false, pointsEarned: 0 };
  }

  const selected = question.options.find(
    (option) => option.id === answer.selectedOptionId,
  );
  const isCorrect = Boolean(selected?.isCorrect);
  return {
    questionId: question.id,
    isCorrect,
    pointsEarned: isCorrect ? question.points : 0,
  };
}
