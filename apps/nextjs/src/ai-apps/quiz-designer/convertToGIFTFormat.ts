import type {
  ExportableQuizAppState,
  ExportableQuizQuestion,
} from "@oakai/exports/src/schema/input.schema";

export function convertToGIFTFormat(
  exportableQuizData: ExportableQuizAppState,
): string {
  let giftString = "";
  const questions: ExportableQuizQuestion[] = exportableQuizData.questions;

  for (const question of questions) {
    let questionType = "Multiple Choice";
    if (question.answers.length > 1) {
      questionType = "Multiple Choice with Multiple Answers";
    }

    giftString += `::${questionType}::${question.question} {`;

    // Add correct answers
    for (const answer of question.answers) {
      giftString += `\n\t=${answer}`;
    }

    // Add distractors for Multiple Choice questions
    if (questionType === "Multiple Choice") {
      for (const distractor of question.distractors) {
        giftString += `\n\t~${distractor}`;
      }
    }

    giftString += "\n}\n";
  }

  return giftString;
}
