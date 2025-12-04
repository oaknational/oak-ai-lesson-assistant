import type { LatestQuiz } from "../../protocol/schemas/quiz";
import type { RagQuizQuestion } from "./interfaces";

/**
 * Combines RAG quiz questions into a complete Quiz object.
 * Aggregates all questions and their image metadata.
 */
export function buildQuizFromQuestions(
  ragQuestions: RagQuizQuestion[],
): LatestQuiz {
  return {
    version: "v3",
    questions: ragQuestions.map((rq) => rq.question),
    imageMetadata: ragQuestions.flatMap((rq) => rq.imageMetadata),
  };
}
