import { CohereClient } from "cohere-ai";
import type { RerankRequest, RerankResponse } from "cohere-ai/api";

import type { RagLessonPlanResult } from "../types";

export async function rerankResults({
  cohereClient,
  query,
  results,
}: {
  cohereClient: CohereClient;
  query: string;
  results: RagLessonPlanResult[];
}): Promise<RagLessonPlanResult[]> {
  const topN = 5;

  const rerankRequest: RerankRequest = {
    documents: results.map((result) => JSON.stringify(result.lesson_plan)),
    returnDocuments: false,
    query,
    topN,
  };

  const rerank: RerankResponse = await cohereClient.rerank(rerankRequest);

  const mostRelevantHydrated = rerank.results
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .map((r) => {
      const result = results[r.index];
      if (!result) {
        throw new Error(`Lesson plan not found at index ${r.index}`);
      }
      return result;
    });

  return mostRelevantHydrated;
}
