/**
 * Sometimes a section might have multiple candidates.
 * This allows us to test the different candidates and see which one is preferred by users.
 */
import type { LessonPlanKeys } from "@oakai/aila/src/protocol/schema";

export const multiCandidates: Partial<
  Record<LessonPlanKeys, LessonPlanKeys[]>
> = {
  starterQuiz: ["_experimental_starterQuizMathsV0"],
  exitQuiz: ["_experimental_exitQuizMathsV0"],
};
