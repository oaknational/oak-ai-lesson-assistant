/**
 * V1 to V2 Quiz Schema Conversion
 *
 * This module provides utilities to convert V1 quiz format (multiple choice only)
 * to V2 format (discriminated union supporting multiple quiz types).
 */
import type { QuizV1, QuizV1Question, QuizV2, QuizV2Question } from "..";

/**
 * Convert a V1 quiz question (MC only) to V2 format
 */
export function convertQuizV1QuestionToV2(
  questionV1: QuizV1Question,
): QuizV2Question {
  return {
    questionType: "multiple-choice",
    question: questionV1.question,
    answers: questionV1.answers,
    distractors: questionV1.distractors,
    hint: null,
  };
}

/**
 * Convert an entire V1 quiz to V2 format
 */
export function convertQuizV1ToV2(quizV1: QuizV1): QuizV2 {
  return {
    version: "v2",
    questions: quizV1.map(convertQuizV1QuestionToV2),
    imageAttributions: [],
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

/**
 * Type guard to check if a quiz is V1 format
 */
export function isQuizV1(
  quiz: QuizV1 | QuizV2 | null | undefined,
): quiz is QuizV1 {
  return Array.isArray(quiz);
}

/**
 * Type guard to check if a quiz is V2 format
 */
export function isQuizV2(
  quiz: QuizV1 | QuizV2 | null | undefined,
): quiz is QuizV2 {
  return (
    quiz != null &&
    typeof quiz === "object" &&
    "version" in quiz &&
    quiz.version === "v2"
  );
}
