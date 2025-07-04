import type { QuizV2, QuizV2Question } from "../quizV2";
import type {
  ImageItem,
  ImageOrTextItem,
  RawQuiz,
  StemImageObject,
  TextItem,
} from "../rawQuiz";

/**
 * Check if an item is a text item
 */
function isTextItem(item: ImageOrTextItem): item is TextItem {
  return item.type === "text";
}

/**
 * Check if an item is an image item
 */
function isImageItem(item: ImageOrTextItem): item is ImageItem {
  return item.type === "image";
}

/**
 * Extract markdown content from Oak's content items array, inlining images
 * Returns both the markdown content and attribution metadata
 */
function extractMarkdownFromContent(
  contentItems: Array<TextItem | ImageItem | undefined>,
): {
  markdown: string;
  attributions: Array<{ imageUrl: string; attribution: string }>;
} {
  const attributions: Array<{ imageUrl: string; attribution: string }> = [];

  const markdownParts = contentItems
    .filter((item): item is TextItem | ImageItem => item !== undefined)
    .map((item) => {
      if (isTextItem(item)) {
        return item.text || "";
      } else if (isImageItem(item)) {
        const imageUrl = item.image_object.secure_url;

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

        // Return markdown image syntax
        return `![](${imageUrl})`;
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
    };
  }

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
        };
      }

      // Extract question stem as markdown with inlined images
      const { markdown: questionStem, attributions } =
        extractMarkdownFromContent(rawQuestion.question_stem);

      // Handle different question types based on Oak's schema
      switch (rawQuestion.question_type) {
        case "multiple-choice": {
          const mcAnswers = rawQuestion.answers?.["multiple-choice"] || [];

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
          const allAttributions = [
            ...attributions,
            ...correctAnswerResults.flatMap((result) => result.attributions),
            ...distractorResults.flatMap((result) => result.attributions),
          ];

          return {
            questionType: "multiple-choice" as const,
            question: questionStem,
            answers: correctAnswers,
            distractors,
          };
        }

        case "short-answer": {
          const saAnswers = rawQuestion.answers?.["short-answer"] || [];
          const answerResults = saAnswers.map((answer) =>
            extractMarkdownFromContent(answer.answer || []),
          );
          const answers = answerResults.map((result) => result.markdown);

          const allAttributions = [
            ...attributions,
            ...answerResults.flatMap((result) => result.attributions),
          ];

          return {
            questionType: "short-answer" as const,
            question: questionStem,
            answers,
          };
        }

        case "match": {
          const matchAnswers = rawQuestion.answers?.match || [];
          const pairs = matchAnswers.map((matchItem) => {
            const leftResult = extractMarkdownFromContent(
              matchItem.match_option || [],
            );
            const rightResult = extractMarkdownFromContent(
              matchItem.correct_choice || [],
            );

            attributions.push(
              ...leftResult.attributions,
              ...rightResult.attributions,
            );

            return {
              left: leftResult.markdown,
              right: rightResult.markdown,
            };
          });

          return {
            questionType: "match" as const,
            question: questionStem,
            pairs,
          };
        }

        case "order": {
          const orderAnswers = rawQuestion.answers?.order || [];
          const itemResults = orderAnswers.map((orderItem) =>
            extractMarkdownFromContent(orderItem.answer || []),
          );
          const items = itemResults.map((result) => result.markdown);

          const allAttributions = [
            ...attributions,
            ...itemResults.flatMap((result) => result.attributions),
          ];

          return {
            questionType: "order" as const,
            question: questionStem,
            items,
          };
        }

        default:
          // Fallback for unknown question types
          return {
            questionType: "multiple-choice" as const,
            question: questionStem,
            answers: ["N/A"],
            distractors: ["N/A"],
          };
      }
    });

  return {
    version: "v2",
    questions,
  };
}
