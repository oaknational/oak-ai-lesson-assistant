import type { PrismaClientWithAccelerate } from "@oakai/db";
import { aiLogger } from "@oakai/logger";
import type OpenAI from "openai";
import { uniqBy } from "remeda";

import type { CompletedLessonPlan } from "../../../aila/src/protocol/schema";

type RagLessonPlanResult = {
  rag_lesson_plan_id: string;
  lesson_plan: CompletedLessonPlan;
  key: string;
  value_text: string;
  distance: number;
};

const log = aiLogger("rag");
/**
 *
 */
export class RagLessonPlans {
  constructor(
    private readonly prisma: PrismaClientWithAccelerate,
    private readonly openai: OpenAI,
  ) {}

  async getRelevantLessonPlans({
    title,
    keyStageSlugs,
    subjectSlugs,
  }: {
    title: string;
    keyStageSlugs: string[] | null;
    subjectSlugs: string[] | null;
  }): Promise<RagLessonPlanResult[]> {
    if (!keyStageSlugs?.length) {
      throw new Error("No key stages provided");
    }
    if (!subjectSlugs?.length) {
      throw new Error("No subjects provided");
    }
    const embedding = await this.openai.embeddings.create({
      model: "text-embedding-3-large",
      dimensions: 256,
      input: title,
      encoding_format: "float",
    });

    const queryEmbedding = `[${embedding.data[0]?.embedding.join(",")}]`;
    const limit = 50;

    const startAt = new Date();
    log.info(
      `Fetching relevant lesson plans for ${title}, in ${keyStageSlugs} and ${subjectSlugs}`,
    );

    const results = await this.prisma.$queryRaw<RagLessonPlanResult[]>`
        SELECT rag_lesson_plan_id, lesson_plan, key, value_text, embedding <-> ${queryEmbedding}::vector as distance
        FROM rag.rag_lesson_plan_parts JOIN rag.rag_lesson_plans ON rag_lesson_plan_id = rag_lesson_plans.id
        WHERE rag_lesson_plans.is_published = true
          AND key_stage_slug IN (${keyStageSlugs.join(",")})
          AND subject_slug IN (${subjectSlugs.join(",")})
        ORDER BY embedding <-> ${queryEmbedding}::vector
        LIMIT ${limit};
    `;

    log.info(results.map((r) => r.lesson_plan.title).join(",\n"));

    const endAt = new Date();
    log.info(
      `Fetched ${results.length} lesson plans in ${endAt.getTime() - startAt.getTime()}ms`,
    );

    const uniqueLessonPlans = uniqBy(results, (r) => r.rag_lesson_plan_id);

    log.info(`Unique lesson plans: ${uniqueLessonPlans.length}`);

    return uniqueLessonPlans;
  }
}
