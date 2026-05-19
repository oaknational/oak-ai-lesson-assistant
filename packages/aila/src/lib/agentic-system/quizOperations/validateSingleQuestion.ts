import { QuizV3QuestionSchema } from "../../../protocol/schemas/quiz/quizV3";

export function validateSingleQuestion(value: unknown): boolean {
  const result = QuizV3QuestionSchema.safeParse(value);
  if (!result.success) return false;
  return result.data.question.trim().length > 0;
}
