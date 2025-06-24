/**
 * Raw Quiz Schema Ingestion
 *
 * This module handles conversion from Oak's raw quiz schema format
 * to our internal V2 quiz format. It bridges the gap between Oak's
 * curriculum data and Aila's internal schema.
 */
import type { QuizV2, QuizV2Question, QuizV2ContentArray } from "..";
import { type RawQuiz } from "../rawQuiz";

/**
 * Convert Oak's raw quiz schema to our V2 format
 * This bridges the gap between Oak's curriculum schema and Aila's internal schema
 */
export function convertRawQuizToV2(rawQuiz: RawQuiz): QuizV2 {
  if (!rawQuiz || !Array.isArray(rawQuiz)) {
    return { version: "v2", questions: [] };
  }

  const questions = rawQuiz.map((rawQuestion): QuizV2Question => {
    if (!rawQuestion) {
      // Fallback for invalid questions
      return {
        questionType: "multiple-choice" as const,
        questionStem: [{ type: "text", text: "Invalid question" }],
        answers: [[{ type: "text", text: "N/A" }]],
        distractors: [[{ type: "text", text: "N/A" }]],
        feedback: undefined,
        hint: undefined,
      };
    }

    // Extract question stem as rich content array
    const questionStem = convertOakItemsToContentArray(rawQuestion.question_stem);

    const feedback = rawQuestion.feedback || undefined;
    const hint = rawQuestion.hint || undefined;

    // Handle different question types based on Oak's schema
    switch (rawQuestion.question_type) {
      case "multiple-choice": {
        const mcAnswers = rawQuestion.answers?.["multiple-choice"] || [];
        const correctAnswers = mcAnswers
          .filter((answer) => answer.answer_is_correct)
          .map((answer) => convertOakItemsToContentArray(answer.answer || []));
        const distractors = mcAnswers
          .filter((answer) => !answer.answer_is_correct)
          .map((answer) => convertOakItemsToContentArray(answer.answer || []));

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
          convertOakItemsToContentArray(answer.answer || []),
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
          left: convertOakItemsToContentArray(match.match_option || []),
          right: convertOakItemsToContentArray(match.correct_choice || []),
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
          .map((order) => convertOakItemsToContentArray(order.answer || []));

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
          answers: [[{ type: "text", text: "Unknown question type" }]],
          distractors: [[{ type: "text", text: "N/A" }], [{ type: "text", text: "N/A" }]],
          feedback,
          hint,
        };
    }
  });

  return { version: "v2", questions };
}

/**
 * Convert Oak's text/image items to our rich content array format
 * This handles the conversion from Oak's snake_case structure to our rich content
 */
function convertOakItemsToContentArray(
  items: Array<{ 
    type?: string; 
    text?: string; 
    image_object?: { 
      secure_url?: string; 
      url?: string; 
      width?: number; 
      height?: number; 
      metadata?: { attribution?: string; usageRestriction?: string } | unknown[]
    } 
  } | undefined> | undefined
): QuizV2ContentArray {
  if (!items || !Array.isArray(items)) {
    return [{ type: "text", text: "" }];
  }

  const contentItems = items
    .filter((item) => item != null)
    .map((item) => {
      if (item.type === "text" && item.text) {
        return { type: "text" as const, text: item.text };
      } else if (item.type === "image" && item.image_object) {
        const img = item.image_object;
        // Extract attribution from metadata if it's an object, not an array
        const attribution = 
          img.metadata && typeof img.metadata === 'object' && !Array.isArray(img.metadata)
            ? img.metadata.attribution
            : undefined;
            
        return {
          type: "image" as const,
          image: {
            url: img.secure_url || img.url || "",
            width: img.width,
            height: img.height,
            attribution,
            // NOTE: usageRestriction omitted - if restrictions existed, content likely wouldn't reach this stage from recommender
          },
        };
      }
      return null;
    })
    .filter((item) => item !== null);

  // Return at least one text item if no valid content was found
  return contentItems.length > 0 ? contentItems : [{ type: "text", text: "" }];
}

