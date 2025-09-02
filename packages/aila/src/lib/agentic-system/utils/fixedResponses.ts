import type { AgenticRagLessonPlanResult } from "../types";

export function displayRelevantLessons(
  relevantLessons: AgenticRagLessonPlanResult[],
): string {
  return `I have fetched the following existing Oak lessons that look relevant:
${relevantLessons.map(({ lessonPlan }, i) => `${i + 1}. ${lessonPlan.title}`).join("\n")}
\n
Would you like to base your lesson on one of these? Otherwise we can create one from scratch!`;
}

export function genericErrorMessage(): string {
  return "We encountered an error while processing your request.";
}
