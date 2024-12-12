import type { PrismaClientWithAccelerate } from "@oakai/db";
import { uniqBy } from "remeda";
import { z } from "zod";

import { CompletedLessonPlanSchema } from "../../aila/src/protocol/schema";
import type { RagLessonPlanResult, RagLogger } from "../types";

const databaseResponseSchema = z.array(
  z.object({
    rag_lesson_plan_id: z.string(),
    lesson_plan: CompletedLessonPlanSchema,
    key: z.string(),
    value_text: z.string(),
    distance: z.number(),
  }),
);

export async function vectorSearch({
  prisma,
  log,
  queryVector,
  filters,
}: {
  prisma: PrismaClientWithAccelerate;
  log: RagLogger;
  queryVector: number[];
  filters: {
    keyStageSlugs: string[] | null;
    subjectSlugs: string[] | null;
  };
}): Promise<RagLessonPlanResult[]> {
  const { keyStageSlugs, subjectSlugs } = filters;
  if (!keyStageSlugs?.length) {
    throw new Error("No key stages provided");
  }
  if (!subjectSlugs?.length) {
    throw new Error("No subjects provided");
  }

  const queryEmbedding = `[${queryVector.join(",")}]`;
  const limit = 50;
  const startAt = new Date();
  const response = await prisma.$queryRaw<RagLessonPlanResult[]>`
          SELECT rag_lesson_plan_id, lesson_plan, key, value_text, embedding <-> ${queryEmbedding}::vector as distance
          FROM rag.rag_lesson_plan_parts JOIN rag.rag_lesson_plans ON rag_lesson_plan_id = rag_lesson_plans.id
          WHERE rag_lesson_plans.is_published = true
            AND key_stage_slug IN (${keyStageSlugs.join(",")})
            AND subject_slug IN (${subjectSlugs.join(",")})
          ORDER BY embedding <-> ${queryEmbedding}::vector
          LIMIT ${limit};
      `;

  const results = databaseResponseSchema.parse(response);

  log.info(results.map((r) => r.lesson_plan.title).join(",\n"));

  const endAt = new Date();
  log.info(
    `Fetched ${results.length} lesson plans in ${endAt.getTime() - startAt.getTime()}ms`,
  );

  const uniqueLessonPlans = uniqBy(results, (r) => r.rag_lesson_plan_id);

  log.info(`Unique lesson plans: ${uniqueLessonPlans.length}`);

  return uniqueLessonPlans;
}
