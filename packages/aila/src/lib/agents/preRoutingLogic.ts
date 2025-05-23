import type { AilaRagRelevantLesson } from "../../protocol/schema";

export async function preRoutingLogic({
  relevantLessons,
}: {
  relevantLessons: AilaRagRelevantLesson[] | null;
}) {
  if (relevantLessons === null) {
    return {
      result: {
        type: "fetch_relevant_lessons",
      },
    };
  }
}
