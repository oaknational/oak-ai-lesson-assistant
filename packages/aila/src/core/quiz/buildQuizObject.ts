import type { LatestQuiz } from "../../protocol/schemas/quiz";
import type { RagQuizQuestion } from "./interfaces";

/**
 * Combines RAG quiz questions into a complete Quiz object.
 * Aggregates all questions and their image metadata.
 *
 * @param ragQuestions - The selected questions from the quiz pipeline
 * @param reportId - ID linking to the generation report in KV storage
 * @param bailReason - If the composer bailed, the reason why (optional)
 */
export function buildQuizFromQuestions(
  ragQuestions: RagQuizQuestion[],
  reportId: string,
  bailReason?: string,
): LatestQuiz {
  return {
    version: "v3",
    questions: ragQuestions.map((rq) => rq.question),
    imageMetadata: ragQuestions.flatMap((rq) => rq.imageMetadata),
    reportId,
    ...(bailReason && { bailReason }),
  };
}
