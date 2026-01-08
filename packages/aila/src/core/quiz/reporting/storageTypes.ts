import type { FinalReport } from "./Report";

/**
 * A quiz generation report stored in KV.
 *
 * Extends FinalReport with storage metadata. The report captures the full
 * execution tree of the quiz generation pipeline along with its reportId.
 *
 * Context (quizType, lessonTitle, etc.) is stored in the report's root data
 * via task.addData() at the start of the pipeline run.
 *
 * NOTE: No formal zod schema validation yet - this structure may evolve.
 * Consider adding schema validation if/when we need to migrate stored reports.
 */
export type StoredQuizReport = FinalReport & {
  /** Report format version for future migrations */
  reportVersion: "v1";
};
