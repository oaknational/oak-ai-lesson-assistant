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
  const parseErrors: { ragLessonPlanId?: string; error: string }[] = [];
  const results = queryResponse
    .map(preparseResult)
    .filter(parseResult({ onError: (e) => parseErrors.push(e) }));

  /**
   * @todo Handle parse errors (i.e. record in DB so we can re-ingest!)
   */
  log.info(`Parse errors: ${parseErrors.length}`);
  log.info(`Invalid results: ${queryResponse.length - results.length}`);
  log.info(`Valid results: ${results.length}`);

  // Log first 3 parse errors for debugging
  parseErrors.slice(0, 3).forEach((error, index) => {
    log.error(`Parse error ${index + 1}:`, error);
  });

  // Throw if we have at least 3 rows but all failed to parse
  if (queryResponse.length >= 3 && results.length === 0) {
    throw new Error(`All RAG results failed to parse. Found ${queryResponse.length} results but all ${parseErrors.length} failed validation. Check logs above for details.`);
  }

  const endAt = new Date();
  log.info(
    `Fetched ${results.length} lesson plans in ${endAt.getTime() - startAt.getTime()}ms`,
  );

  const uniqueLessonPlans = uniqBy(results, (r) => r.ragLessonPlanId);

  log.info(`Unique lesson plans: ${uniqueLessonPlans.length}`);

  return uniqueLessonPlans;
}
