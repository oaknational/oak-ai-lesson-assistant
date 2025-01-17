import type { PrismaClientWithAccelerate } from "@oakai/db";

import type { DeepPartial, RagLessonPlanResult } from "../../types";

export function executePrismaQueryRaw({
  prisma,
  queryEmbedding,
  keyStageSlugs,
  subjectSlugs,
  limit,
}: {
  prisma: PrismaClientWithAccelerate;
  queryEmbedding: string;
  keyStageSlugs: string[];
  subjectSlugs: string[];
  limit: number;
}) {
  return prisma.$queryRaw<DeepPartial<RagLessonPlanResult>[]>`
    SELECT
      rag_lesson_plan_id as "ragLessonPlanId",
      oak_lesson_id as "oakLessonId",
      oak_lesson_slug as "oakLessonSlug",
      lesson_plan as "lessonPlan",
      key as "matchedKey",
      value_text as "matchedValue",
      embedding <-> ${queryEmbedding}::vector as distance
    FROM rag.rag_lesson_plan_parts JOIN rag.rag_lesson_plans ON rag_lesson_plan_id = rag_lesson_plans.id
    WHERE rag_lesson_plans.is_published = true
      AND key_stage_slug IN (${keyStageSlugs.join(",")})
      AND subject_slug IN (${subjectSlugs.join(",")})
    ORDER BY embedding <-> ${queryEmbedding}::vector
    LIMIT ${limit};
  `;
}
