import { parseKeyStage } from "@oakai/core/src/data/parseKeyStage";
import { getRelevantLessonPlans, parseSubjectsForRagSearch } from "@oakai/rag";

import type { LooseLessonPlan } from "protocol/schema";

import type { RagLessonPlan } from "../../../utils/rag/fetchRagContent";

export async function fetchRelevantLessonPlans({
  document,
}: {
  document: LooseLessonPlan;
}): Promise<{
  ragLessonPlans: RagLessonPlan[];
}> {
  const { title, keyStage, subject } = document;
  if (!title || !keyStage || !subject) {
    throw new Error(
      "Title, keyStage, and subject are all required to fetch relevant lesson plans",
    );
  }
  const keyStageSlugs = keyStage ? [parseKeyStage(keyStage)] : null;
  const subjectSlugs = subject ? parseSubjectsForRagSearch(subject) : null;

  const relevantLessonPlans = await getRelevantLessonPlans({
    title,
    keyStageSlugs,
    subjectSlugs,
  });

  return {
    ragLessonPlans: relevantLessonPlans.map((l) => ({
      ...l.lessonPlan,
      id: l.ragLessonPlanId,
    })),
  };
}
