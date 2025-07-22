import type { QuizV2, QuizV2Question } from "../quizV2";
import type {
  RawQuiz,
  StemImageObject,
  StemObject,
  StemTextObject,
} from "../rawQuiz";

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
 * Returns both the markdown content and attribution metadata
 */
function extractMarkdownFromContent(
  contentItems: Array<StemObject | undefined>,
): {
  markdown: string;
  attributions: Array<{ imageUrl: string; attribution: string }>;
} {
  const attributions: Array<{ imageUrl: string; attribution: string }> = [];

  const markdownParts = contentItems
    .filter((item): item is StemObject => item !== undefined)
    .map((item) => {
      if (isTextItem(item)) {
        return item.text || "";
      } else if (isImageItem(item)) {
        const imageUrl = item.image_object.secure_url;

        // Extract alt text from context if available
        const altText = item.image_object.context?.custom?.alt ?? "";

        // Extract attribution if available
        if (
          item.image_object.metadata &&
          typeof item.image_object.metadata === "object" &&
          !Array.isArray(item.image_object.metadata)
        ) {
          const attribution = item.image_object.metadata.attribution;
          if (attribution) {
            attributions.push({ imageUrl, attribution });
          }
        }

        // Return markdown image syntax with alt text
        return `![${altText}](${imageUrl})`;
      }
      return "";
    });

  return {
    markdown: markdownParts.join(" ").trim(),
    attributions,
  };
}

/**
 * Convert raw quiz from Oak curriculum format to Quiz V2 format
 */
export function convertRawQuizToV2(rawQuiz: RawQuiz): QuizV2 {
  if (!rawQuiz || !Array.isArray(rawQuiz)) {
    return {
      version: "v2",
      questions: [],
      imageAttributions: [],
    };
  }

  // Collect all image attributions from all questions
  const allImageAttributions: Array<{ imageUrl: string; attribution: string }> =
    [];

  const questions = rawQuiz
    .filter((rawQuestion) => rawQuestion.question_type !== "explanatory-text")
    .map((rawQuestion): QuizV2Question => {
      if (!rawQuestion) {
        // Fallback for invalid questions
        return {
          questionType: "multiple-choice" as const,
          question: "Invalid question",
          answers: ["N/A"],
          distractors: ["N/A"],
          hint: null,
        };
      }

      // Extract question stem as markdown with inlined images
      const { markdown: questionStem, attributions } =
        extractMarkdownFromContent(
          rawQuestion.question_stem as Array<StemObject | undefined>,
        );

      const hint = rawQuestion.hint ?? null;

      // Handle different question types based on Oak's schema
      switch (rawQuestion.question_type) {
        case "multiple-choice": {
          const mcAnswers = rawQuestion.answers?.["multiple-choice"] ?? [];

          const correctAnswerResults = mcAnswers
            .filter((answer) => answer.answer_is_correct)
            .map((answer) => extractMarkdownFromContent(answer.answer || []));
          const correctAnswers = correctAnswerResults.map(
            (result) => result.markdown,
          );

          const distractorResults = mcAnswers
            .filter((answer) => !answer.answer_is_correct)
            .map((answer) => extractMarkdownFromContent(answer.answer || []));
          const distractors = distractorResults.map(
            (result) => result.markdown,
          );

          // Collect all attributions from question and answers
          allImageAttributions.push(
            ...attributions,
            ...correctAnswerResults.flatMap((result) => result.attributions),
            ...distractorResults.flatMap((result) => result.attributions),
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
          const saAnswers = rawQuestion.answers?.["short-answer"] ?? [];
          const answerResults = saAnswers.map((answer) =>
            extractMarkdownFromContent(answer.answer || []),
          );
          const answers = answerResults.map((result) => result.markdown);

          allImageAttributions.push(
            ...attributions,
            ...answerResults.flatMap((result) => result.attributions),
          );

          return {
            questionType: "short-answer" as const,
            question: questionStem,
            answers,
            hint,
          };
        }

        case "match": {
          const matchAnswers = rawQuestion.answers?.match ?? [];
          const pairs = matchAnswers.map((matchItem) => {
            const leftResult = extractMarkdownFromContent(
              matchItem.match_option ?? [],
            );
            const rightResult = extractMarkdownFromContent(
              matchItem.correct_choice || [],
            );

            allImageAttributions.push(
              ...leftResult.attributions,
              ...rightResult.attributions,
            );

            return {
              left: leftResult.markdown,
              right: rightResult.markdown,
            };
          });

          allImageAttributions.push(...attributions);

          return {
            questionType: "match" as const,
            question: questionStem,
            pairs,
            hint,
          };
        }

        case "order": {
          const orderAnswers = rawQuestion.answers?.order ?? [];
          const itemResults = orderAnswers.map((orderItem) =>
            extractMarkdownFromContent(orderItem.answer || []),
          );
          const items = itemResults.map((result) => result.markdown);

          allImageAttributions.push(
            ...attributions,
            ...itemResults.flatMap((result) => result.attributions),
          );

          return {
            questionType: "order" as const,
            question: questionStem,
            items,
            hint,
          };
        }

        default:
          // Fallback for unknown question types
          allImageAttributions.push(...attributions);

          return {
            questionType: "multiple-choice" as const,
            question: questionStem,
            answers: ["N/A"],
            distractors: ["N/A"],
            hint,
          };
      }
    });

  return {
    version: "v2",
    questions,
    imageAttributions: allImageAttributions,
  };
}
