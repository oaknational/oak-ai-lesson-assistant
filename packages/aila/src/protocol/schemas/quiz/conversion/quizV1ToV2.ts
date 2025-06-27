/**
 * V1 to V2 Quiz Schema Conversion
 *
 * This module provides utilities to convert V1 quiz format (multiple choice only)
 * to V2 format (discriminated union supporting multiple quiz types).
 */
import type {
  QuizV1,
  QuizV1Question,
  QuizV2,
  QuizV2Question,
} from "..";

/**
 * Convert a V1 quiz question (MC only) to V2 format
 */
export function convertQuizV1QuestionToV2(
  questionV1: QuizV1Question,
): QuizV2Question {
  return {
    questionType: "multiple-choice",
    questionStem: questionV1.question,
    answers: questionV1.answers,
    distractors: questionV1.distractors,
    hint: undefined,
  };
}

/**
 * Convert an entire V1 quiz to V2 format
 */
export function convertQuizV1ToV2(quizV1: QuizV1): QuizV2 {
  return {
    version: "v2",
    questions: quizV1.map(convertQuizV1QuestionToV2),
  };
}

/**
 * Detect the quiz schema version
 */
export function detectQuizVersion(
  quiz: QuizV1 | QuizV2,
): "v1" | "v2" | "unknown" {
  // V2 format has version field
  if (typeof quiz === "object" && quiz !== null && "version" in quiz) {
    return "v2";
  }

  // V1 format is an array
  if (Array.isArray(quiz)) {
    return "v1";
  }

  return "unknown";
}
