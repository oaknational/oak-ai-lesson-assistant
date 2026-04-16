import type {
  QuizQuestion,
  QuizQuestionMultipleChoice,
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
  questions: QuizQuestion[],
): QuizQuestionMultipleChoice[] {
  return questions.filter(
    (q): q is QuizQuestionMultipleChoice =>
      q.questionType === "multiple-choice",
  );
}
