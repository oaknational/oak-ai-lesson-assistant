import { parseKeyStage } from "@oakai/core/src/data/parseKeyStage";
import { getRelevantLessonPlans, parseSubjectsForRagSearch } from "@oakai/rag";
import type { RagLessonPlanResult } from "@oakai/rag/types";

import type { LooseLessonPlan } from "protocol/schema";

export async function fetchRelevantLessonPlans({
  document,
}: {
  document: LooseLessonPlan;
}): Promise<RagLessonPlanResult[]> {
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

  return relevantLessonPlans;
}
