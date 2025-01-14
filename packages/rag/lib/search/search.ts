import type { PrismaClientWithAccelerate } from "@oakai/db";
import { uniqBy } from "remeda";

import type { RagLessonPlanResult, RagLogger } from "../../types";
import { executePrismaQueryRaw } from "./executePrismaQueryRaw";
import { parseResult } from "./parseResult";
import { preparseResult } from "./preparseResult";

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
  const queryResponse = await executePrismaQueryRaw({
    prisma,
    queryEmbedding,
    keyStageSlugs,
    subjectSlugs,
    limit,
  });
  const parseErrors: Set<{ ragLessonPlanId?: string; error: string }> =
    new Set();
  const results = queryResponse
    .map(preparseResult)
    .filter(parseResult({ onError: parseErrors.add }));

  /**
   * @todo Handle parse errors (i.e. record in DB so we can re-ingest!)
   */
  log.info(`Parse errors: ${parseErrors.size}`);

  log.info(results.map((r) => r.lessonPlan.title).join(",\n"));

  const endAt = new Date();
  log.info(
    `Fetched ${results.length} lesson plans in ${endAt.getTime() - startAt.getTime()}ms`,
  );

  const uniqueLessonPlans = uniqBy(results, (r) => r.ragLessonPlanId);

  log.info(`Unique lesson plans: ${uniqueLessonPlans.length}`);

  return uniqueLessonPlans;
}
