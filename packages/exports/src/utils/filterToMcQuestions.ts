import type {
  QuizV2Question,
  QuizV2QuestionMultipleChoice,
} from "../schema/input.schema";

/**
 * Filters quiz questions to only include multiple-choice questions for export
 *
 * TODO: This is a temporary limitation. Exports currently only support multiple-choice
 * questions. In the future, we should add support for other question types
 * (short-answer, match, order) in the export templates.
 *
 * @param questions - Array of quiz questions
 * @returns Array of only multiple-choice questions with proper typing
 */
export function filterToMcQuestions(
  questions: QuizV2Question[],
): QuizV2QuestionMultipleChoice[] {
  return questions.filter(
    (q): q is QuizV2QuestionMultipleChoice =>
      q.questionType === "multiple-choice",
  );
}
