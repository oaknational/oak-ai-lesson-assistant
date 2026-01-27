import type { LatestQuiz } from "../../protocol/schemas/quiz";
import type { RagQuizQuestion } from "./interfaces";

/**
 * Combines RAG quiz questions into a complete Quiz object.
 * Aggregates all questions and their image metadata.
 *
 * NOTE: Question provenance (sourceUid) is NOT preserved in the final quiz.
 * The LatestQuizQuestion schema doesn't have a UID field, so we lose the
 * connection to the original Oak question (e.g., "QUES-BPWF2-29205").
 *
 * The only link to provenance is the reportId, which points to the generation
 * report where selected UIDs are logged. To fully track question origins,
 * we'd need to add an optional sourceUid field to LatestQuizQuestion.
 *
 * TODO: Consider adding sourceUid to LatestQuizQuestion schema to preserve
 * question provenance.
 *
 * @param ragQuestions - The selected questions from the quiz pipeline
 * @param reportId - ID linking to the generation report in KV storage
 */
export function buildQuizFromQuestions(
  ragQuestions: RagQuizQuestion[],
  reportId: string,
): LatestQuiz {
  return {
    version: "v3",
    questions: ragQuestions.map((rq) => rq.question),
    imageMetadata: ragQuestions.flatMap((rq) => rq.imageMetadata),
    reportId,
  };
}
