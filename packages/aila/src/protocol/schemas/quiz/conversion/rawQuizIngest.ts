import type {
  imageItemSchema,
  quizQuestionSchema,
  textItemSchema,
} from "@oaknational/oak-curriculum-schema";
import {
  matchSchema,
  multipleChoiceSchema,
  orderSchema,
  shortAnswerSchema,
} from "@oaknational/oak-curriculum-schema";
import { z } from "zod";

import type { QuizV2, QuizV2Question } from "../quizV2";
import type { RawQuiz } from "../rawQuiz";

/**
 * Convert Oak's raw quiz schema to our V2 format
 * This bridges the gap between Oak's curriculum schema and Aila's internal schema
 */
export function convertRawQuizToV2(rawQuiz: RawQuiz): QuizV2 {
  if (!rawQuiz || !Array.isArray(rawQuiz)) {
    return [];
  }

  const questions = rawQuiz.map((rawQuestion): QuizV2Question => {
    if (!rawQuestion) {
      // Fallback for invalid questions
      return {
        questionType: "multiple-choice" as const,
        questionStem: "Invalid question",
        answers: ["N/A"],
        distractors: ["N/A"],
        feedback: undefined,
        hint: undefined,
      };
    }

    // Extract question stem as string for now
    const questionStem = extractTextFromStem(rawQuestion.question_stem);

    const feedback = rawQuestion.feedback || undefined;
    const hint = rawQuestion.hint || undefined;

    // Handle different question types based on Oak's schema
    switch (rawQuestion.question_type) {
      case "multiple-choice": {
        const mcAnswers = rawQuestion.answers?.["multiple-choice"] || [];
        const correctAnswers = mcAnswers
          .filter((answer) => answer.answer_is_correct)
          .map((answer) => extractTextFromAnswer(answer.answer || []));
        const distractors = mcAnswers
          .filter((answer) => !answer.answer_is_correct)
          .map((answer) => extractTextFromAnswer(answer.answer || []));

        return {
          questionType: "multiple-choice" as const,
          questionStem,
          answers: correctAnswers,
          distractors,
          feedback,
          hint,
        };
      }

      case "short-answer": {
        const saAnswers = rawQuestion.answers?.["short-answer"] || [];
        const answers = saAnswers.map((answer) =>
          extractTextFromAnswer(answer.answer || []),
        );

        return {
          questionType: "short-answer" as const,
          questionStem,
          answers,
          feedback,
          hint,
        };
      }

      case "match": {
        const matchAnswers = rawQuestion.answers?.match || [];
        const pairs = matchAnswers.map((match) => ({
          left: extractTextFromAnswer(match.match_option || []),
          right: extractTextFromAnswer(match.correct_choice || []),
        }));

        return {
          questionType: "match" as const,
          questionStem,
          pairs,
          feedback,
          hint,
        };
      }

      case "order": {
        const orderAnswers = rawQuestion.answers?.order || [];
        const items = orderAnswers
          .sort((a, b) => (a.correct_order || 0) - (b.correct_order || 0))
          .map((order) => extractTextFromAnswer(order.answer || []));

        return {
          questionType: "order" as const,
          questionStem,
          items,
          feedback,
          hint,
        };
      }

      case "explanatory-text": {
        return {
          questionType: "explanatory-text" as const,
          questionStem,
          content: questionStem, // For explanatory text, content is the same as stem
          feedback,
          hint,
        };
      }

      default:
        // Fallback to multiple choice for unknown types
        return {
          questionType: "multiple-choice" as const,
          questionStem,
          answers: ["Unknown question type"],
          distractors: ["N/A", "N/A"],
          feedback,
          hint,
        };
    }
  });

  return questions;
}

/**
 * Extract text content from Oak's stem items array
 */
function extractTextFromStem(stemItems: Array<{ type: string; text?: string }>): string {
  return stemItems
    .filter((item) => item.type === "text")
    .map((item) => item.text || "")
    .join(" ");
}

/**
 * Extract text content from Oak's answer items array
 */
function extractTextFromAnswer(answerItems: Array<{ type?: string; text?: string }>): string {
  return answerItems
    .filter((item) => item?.type === "text")
    .map((item) => item?.text || "")
    .join(" ");
}
