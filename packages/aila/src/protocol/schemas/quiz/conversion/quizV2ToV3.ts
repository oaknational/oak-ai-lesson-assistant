import type { QuizV2, QuizV3 } from "../index";

/**
 * Type guard to check if a quiz is V3 format
 */
export const isQuizV3 = (quiz: unknown): quiz is QuizV3 => {
  return (
    typeof quiz === "object" &&
    quiz !== null &&
    "version" in quiz &&
    quiz.version === "v3"
  );
};

/**
 * Convert V2 quiz format to V3 format.
 *
 * Main change: imageAttributions → imageMetadata
 * - V2: { imageUrl: string, attribution: string }
 * - V3: { imageUrl: string, attribution: string | null, width: number, height: number }
 *
 * Since we don't have width/height data in V2, we'll use default dimensions
 * and make attribution nullable as required by V3.
 */
export const convertQuizV2ToV3 = (quizV2: QuizV2): QuizV3 => {
  return {
    version: "v3",
    questions: quizV2.questions, // Questions structure remains the same
    // NOTE: In V3, all images in the quiz should technically have metadata
    imageMetadata: quizV2.imageAttributions.map((attr) => ({
      imageUrl: attr.imageUrl,
      attribution: attr.attribution,
      // Dummy dimensions for pre-production content
      width: 800,
      height: 600,
    })),
  };
};
