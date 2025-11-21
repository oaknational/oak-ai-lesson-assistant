import type { PrismaClientWithAccelerate } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import { Prisma } from "@prisma/client";

import type { DeepPartial, RagLessonPlanResult } from "../../types";

const log = aiLogger("rag");

export function executePrismaQueryRaw({
  prisma,
  queryVector,
  keyStageSlugs,
  subjectSlugs,
  limit,
}: {
  prisma: PrismaClientWithAccelerate;
  queryVector: number[];
  keyStageSlugs: string[];
  subjectSlugs: string[];
  limit: number;
}) {
  log.info("Executing Prisma query with args:", {
    queryVector,
    keyStageSlugs,
    subjectSlugs,
    limit,
  });
  const queryVectorString = `[${queryVector.join(",")}]`;
  return prisma.$queryRaw<DeepPartial<RagLessonPlanResult>[]>`
      SELECT
      rag_lesson_plan_id as "ragLessonPlanId",
      oak_lesson_id as "oakLessonId",
      oak_lesson_slug as "oakLessonSlug",
      lesson_plan as "lessonPlan",
      key as "matchedKey",
      value_text as "matchedValue",
      embedding <-> ${queryVectorString}::vector as distance
    FROM rag.rag_lesson_plan_parts JOIN rag.rag_lesson_plans ON rag_lesson_plan_id = rag_lesson_plans.id
    WHERE rag_lesson_plans.is_published = true
      AND key_stage_slug IN (${Prisma.join(keyStageSlugs)})
      AND subject_slug IN (${Prisma.join(subjectSlugs)})
      AND is_published = true
    ORDER BY distance asc
    LIMIT ${limit};
  `;
}
