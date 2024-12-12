import { prisma } from "@oakai/db";
import { aiLogger } from "@oakai/logger";
import { CohereClient } from "cohere-ai";
import OpenAI from "openai";

import { getEmbedding } from "./lib/embedding";
import { rerankResults } from "./lib/rerank";
import { vectorSearch } from "./lib/search";
import type { RagLessonPlanResult } from "./types";

const log = aiLogger("rag");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const cohereClient = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

export async function getRelevantLessonPlans({
  title,
  keyStageSlugs,
  subjectSlugs,
}: {
  title: string;
  keyStageSlugs: string[] | null;
  subjectSlugs: string[] | null;
}): Promise<RagLessonPlanResult[]> {
  log.info(`Getting embedding for title: ${title}`);
  const queryVector = await getEmbedding({ text: title, openai });
  log.info("Got embedding");

  log.info(`Searching vector database for lesson plans`);
  const vectorSearchResults = await vectorSearch({
    prisma,
    log,
    queryVector,
    filters: {
      keyStageSlugs,
      subjectSlugs,
    },
  });
  log.info(`Got ${vectorSearchResults.length} search results`);

  log.info(`Reranking lesson plans`);
  const rerankedResults = await rerankResults({
    cohereClient,
    query: title,
    results: vectorSearchResults,
  });
  log.info(`Reranked ${rerankedResults.length} lesson plans`);

  return rerankedResults;
}
