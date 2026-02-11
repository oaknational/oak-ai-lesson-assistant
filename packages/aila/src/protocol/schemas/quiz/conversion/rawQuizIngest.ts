import invariant from "tiny-invariant";

import type { ImageMetadata, QuizV3, QuizV3Question } from "../quizV3";
import type {
  HasuraQuiz,
  StemImageObject,
  StemObject,
  StemTextObject,
} from "../rawQuiz";
import { getConstrainedStemImageUrl } from "./cloudinaryImageHelper";

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

function getImageAttribution(item: StemImageObject): string | null {
  if (
    item.image_object.metadata &&
    typeof item.image_object.metadata === "object" &&
    !Array.isArray(item.image_object.metadata)
  ) {
    const attribution = item.image_object.metadata.attribution;
    if (attribution) {
      return attribution;
    }
  }
  return null;
}

/**
 * Check if a text string is just a single answer letter (A-D, a-d) with optional period
 * These should be filtered out when other content (like images) is present
 */
function isSingleAnswerLetter(text: string): boolean {
  return /^[A-Da-d]\.?$/.test(text.trim());
}

/**
 * Extract markdown content from Oak's content items array, inlining images
 * Returns both the markdown content and image metadata
 */
function buildMarkdownFromContent(
  contentItems: Array<StemObject | undefined>,
): {
  markdown: string;
  metadata: ImageMetadata[];
} {
  const metadata: ImageMetadata[] = [];

  const validItems = contentItems.filter(
    (item): item is StemObject => item !== undefined,
  );

  const hasImage = validItems.some(isImageItem);

  const markdownParts = validItems
    .filter((item) => {
      // Filter out answer letters (A,B,C) when alongside an image
      if (hasImage && isTextItem(item)) {
        const text = item.text || "";
        return !isSingleAnswerLetter(text);
      }
      return true; // Keep all other items (images, and text when no images present)
    })
    .map((item) => {
      if (isTextItem(item)) {
        return item.text || "";
      } else if (isImageItem(item)) {
        const imageUrl = getConstrainedStemImageUrl(item);
        const width = item.image_object.width;
        const height = item.image_object.height;
        invariant(width && height, `Image ${imageUrl} has no dimensions`);

        // Extract alt text from context if available
        const altText = item.image_object.context?.custom?.alt ?? "";

        // Build metadata object for this image
        const imageMetadata: ImageMetadata = {
          imageUrl,
          attribution: getImageAttribution(item),
          width,
          height,
        };

        // Push to the list of metadata
        metadata.push(imageMetadata);

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
 * Convert Hasura quiz format to Quiz V3 format
 */
export function convertHasuraQuizToV3(hasuraQuiz: HasuraQuiz): QuizV3 {
  if (!hasuraQuiz || !Array.isArray(hasuraQuiz)) {
    return {
      version: "v3",
      questions: [],
      imageMetadata: [],
    };
  }

  // Collect all image metadata from all questions
  const allImageMetadata: ImageMetadata[] = [];

  const questions = hasuraQuiz
    .filter(
      (hasuraQuestion) => hasuraQuestion.questionType !== "explanatory-text",
    )
    .map((hasuraQuestion): QuizV3Question => {
      // Early return for explanatory-text (should be filtered out already)
      if (hasuraQuestion.questionType === "explanatory-text") {
        throw new Error("Explanatory text questions should be filtered out");
      }
      // Extract question stem as markdown with inlined images
      const { markdown: questionStem, metadata } = buildMarkdownFromContent(
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
              return buildMarkdownFromContent(answer.answer);
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
              return buildMarkdownFromContent(answer.answer);
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
            return buildMarkdownFromContent(answer.answer);
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
            const leftResult = buildMarkdownFromContent(
              matchItem.match_option ?? [],
            );
            const rightResult = buildMarkdownFromContent(
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
            buildMarkdownFromContent(orderItem.answer || []),
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
    version: "v3",
    questions,
    imageMetadata: allImageMetadata,
  };
}
