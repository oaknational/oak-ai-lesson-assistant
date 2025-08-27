import { aiLogger } from "@oakai/logger";

import invariant from "tiny-invariant";

import type { QuizV2, QuizV2Question } from "../quizV2";
import type {
  HasuraQuiz,
  StemImageObject,
  StemObject,
  StemTextObject,
} from "../rawQuiz";

const log = aiLogger("aila:quiz");

/**
 * Check if an item is a text item
 */
function isTextItem(item: StemObject): item is StemTextObject {
  return item.type === "text";
}

/**
 * Check if an item is an image item
 */
function isImageItem(item: StemObject): item is StemImageObject {
  return item.type === "image";
}

/**
 * Extract markdown content from Oak's content items array, inlining images
 * Returns both the markdown content and image metadata
 */
function extractMarkdownFromContent(
  contentItems: Array<StemObject | undefined>,
): {
  markdown: string;
  metadata: Array<{
    imageUrl: string;
    attribution?: string;
    width?: number;
    height?: number;
  }>;
} {
  const metadata: Array<{
    imageUrl: string;
    attribution?: string;
    width?: number;
    height?: number;
  }> = [];

  const markdownParts = contentItems
    .filter((item): item is StemObject => item !== undefined)
    .map((item) => {
      if (isTextItem(item)) {
        return item.text || "";
      } else if (isImageItem(item)) {
        const imageUrl = item.image_object.secure_url;
        const width = item.image_object.width;
        const height = item.image_object.height;

        // Extract alt text from context if available
        const altText = item.image_object.context?.custom?.alt ?? "";

        // Build metadata object for this image
        const imageMetadata: {
          imageUrl: string;
          attribution?: string;
          width?: number;
          height?: number;
        } = { imageUrl };

        // Extract attribution if available
        if (
          item.image_object.metadata &&
          typeof item.image_object.metadata === "object" &&
          !Array.isArray(item.image_object.metadata)
        ) {
          const attribution = item.image_object.metadata.attribution;
          if (attribution) {
            imageMetadata.attribution = attribution;
          }
        }

        // Add dimensions if available
        if (width) imageMetadata.width = width;
        if (height) imageMetadata.height = height;

        // Push metadata if we have any useful information (attribution OR dimensions)
        if (
          imageMetadata.attribution ||
          imageMetadata.width ||
          imageMetadata.height
        ) {
          metadata.push(imageMetadata);
        }

        // Return markdown image syntax with alt text
        return `![${altText}](${imageUrl})`;
      }
      return "";
    });

  return {
    markdown: markdownParts.join(" ").trim(),
    metadata,
  };
}

/**
 * Convert Hasura quiz format to Quiz V2 format
 */
export function convertHasuraQuizToV2(hasuraQuiz: HasuraQuiz): QuizV2 {
  log.info("convertHasuraQuizToV2 input:", { hasuraQuiz });

  if (!hasuraQuiz || !Array.isArray(hasuraQuiz)) {
    log.info("Hasura quiz is not an array, returning empty quiz");
    return {
      version: "v2",
      questions: [],
      imageAttributions: [],
    };
  }

  // Collect all image metadata from all questions
  const allImageMetadata: Array<{
    imageUrl: string;
    attribution?: string;
    width?: number;
    height?: number;
  }> = [];

  const questions = hasuraQuiz
    .filter(
      (hasuraQuestion) => hasuraQuestion.questionType !== "explanatory-text",
    )
    .map((hasuraQuestion): QuizV2Question => {
      log.info("Processing hasura question:", { hasuraQuestion });

      // Early return for explanatory-text (should be filtered out already)
      if (hasuraQuestion.questionType === "explanatory-text") {
        throw new Error("Explanatory text questions should be filtered out");
      }
      // Extract question stem as markdown with inlined images
      const { markdown: questionStem, metadata } = extractMarkdownFromContent(
        hasuraQuestion.questionStem,
      );

      const hint = hasuraQuestion.hint ?? null;

      // Handle different question types based on Oak's schema
      switch (hasuraQuestion.questionType) {
        case "multiple-choice": {
          const mcAnswers = hasuraQuestion.answers?.["multiple-choice"] ?? [];

          const correctAnswerResults = mcAnswers
            .filter((answer) => answer.answer_is_correct)
            .map((answer) => {
              invariant(
                answer.answer,
                "Multiple choice answer missing 'answer' field",
              );
              return extractMarkdownFromContent(answer.answer);
            });
          const correctAnswers = correctAnswerResults.map(
            (result) => result.markdown,
          );

          const distractorResults = mcAnswers
            .filter((answer) => !answer.answer_is_correct)
            .map((answer) => {
              invariant(
                answer.answer,
                "Multiple choice answer missing 'answer' field",
              );
              return extractMarkdownFromContent(answer.answer);
            });
          const distractors = distractorResults.map(
            (result) => result.markdown,
          );

          // Collect all metadata from question and answers
          allImageMetadata.push(
            ...metadata,
            ...correctAnswerResults.flatMap((result) => result.metadata),
            ...distractorResults.flatMap((result) => result.metadata),
          );

          return {
            questionType: "multiple-choice" as const,
            question: questionStem,
            answers: correctAnswers,
            distractors,
            hint,
          };
        }

        case "short-answer": {
          const saAnswers = hasuraQuestion.answers?.["short-answer"] ?? [];
          const answerResults = saAnswers.map((answer) => {
            invariant(answer.answer, "Short answer missing 'answer' field");
            return extractMarkdownFromContent(answer.answer);
          });
          const answers = answerResults.map((result) => result.markdown);

          allImageMetadata.push(
            ...metadata,
            ...answerResults.flatMap((result) => result.metadata),
          );

          return {
            questionType: "short-answer" as const,
            question: questionStem,
            answers,
            hint,
          };
        }

        case "match": {
          const matchAnswers = hasuraQuestion.answers?.match ?? [];
          const pairs = matchAnswers.map((matchItem) => {
            const leftResult = extractMarkdownFromContent(
              matchItem.match_option ?? [],
            );
            const rightResult = extractMarkdownFromContent(
              matchItem.correct_choice || [],
            );

            allImageMetadata.push(
              ...leftResult.metadata,
              ...rightResult.metadata,
            );

            return {
              left: leftResult.markdown,
              right: rightResult.markdown,
            };
          });

          allImageMetadata.push(...metadata);

          return {
            questionType: "match" as const,
            question: questionStem,
            pairs,
            hint,
          };
        }

        case "order": {
          const orderAnswers = hasuraQuestion.answers?.order ?? [];
          const itemResults = orderAnswers.map((orderItem) =>
            extractMarkdownFromContent(orderItem.answer || []),
          );
          const items = itemResults.map((result) => result.markdown);

          allImageMetadata.push(
            ...metadata,
            ...itemResults.flatMap((result) => result.metadata),
          );

          return {
            questionType: "order" as const,
            question: questionStem,
            items,
            hint,
          };
        }

        default: {
          const _exhaustiveCheck: never = hasuraQuestion.questionType;
          throw new Error(
            `Unknown question type: ${_exhaustiveCheck as string}`,
          );
        }
      }
    });

  return {
    version: "v2",
    questions,
    imageAttributions: allImageMetadata,
  };
}
