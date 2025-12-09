import type { PrismaClientWithAccelerate } from "@oakai/db";

import { uniqBy } from "remeda";

import type { RagLessonPlanResult, RagLogger } from "../../types";
import { executePrismaQueryRaw } from "./executePrismaQueryRaw";
import { parseResult } from "./parseResult";
import { preparseResult } from "./preparseResult";

const UNIQUE_LESSON_PLANS_LIMIT = 5;

/**
 * We currently store key stages in Aila as key-stage-1, key-stage-2, etc.
 * But in the vector DB they are stored as ks1, ks2, etc. So we need to
 * convert between the two formats when searching and when displaying
 */
const keyStageForSearch = (ks: string) =>
  ({
    "key-stage-1": "ks1",
    "key-stage-2": "ks2",
    "key-stage-3": "ks3",
    "key-stage-4": "ks4",
  })[ks] ?? ks;

const keyStageFromSearch = (ks: string) =>
  ({
    ks1: "key-stage-1",
    ks2: "key-stage-2",
    ks3: "key-stage-3",
    ks4: "key-stage-4",
  })[ks] ?? ks;

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

  const limit = 50;
  const startAt = new Date();
  const queryResponse = await executePrismaQueryRaw({
    prisma,
    queryVector,
    keyStageSlugs: keyStageSlugs.map(keyStageForSearch),
    subjectSlugs,
    limit,
  });
  log.info(`Prisma returned ${queryResponse.length} lesson plan part results`);

  const parseErrors: { ragLessonPlanId?: string; error: string }[] = [];
  const preParsedResults = await Promise.all(queryResponse.map(preparseResult));

  const results = preParsedResults
    .filter(
      parseResult({
        onError: (e) => {
          log.error("ERROR!!!");
          return parseErrors.push(e);
        },
      }),
    )
    .map((result) => ({
      ...result,
      lessonPlan: {
        ...result.lessonPlan,
        keyStage: keyStageFromSearch(result.lessonPlan.keyStage),
      },
      // Note: for some reason TS isn't narrowing the type all of a sudden so we need to assert
    })) as RagLessonPlanResult[];

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
    throw new Error(
      `All RAG results failed to parse. Found ${queryResponse.length} results but all ${parseErrors.length} failed validation. Check logs above for details.`,
    );
  }

  const endAt = new Date();
  log.info(
    `Fetched ${results.length} lesson plans in ${endAt.getTime() - startAt.getTime()}ms`,
  );

  const uniqueLessonPlans = uniqBy(results, (r) => r.ragLessonPlanId);

  log.info(`Unique lesson plans: ${uniqueLessonPlans.length}`);

  return uniqueLessonPlans.slice(0, UNIQUE_LESSON_PLANS_LIMIT);
}
