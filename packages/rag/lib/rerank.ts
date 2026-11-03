import type { Cohere, CohereClient } from "cohere-ai";

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

  const rerankRequest: Cohere.RerankRequest = {
    documents: results.map((result) => JSON.stringify(result.lessonPlan)),
    returnDocuments: false,
    query,
    topN,
  };

  const rerank: Cohere.RerankResponse =
    await cohereClient.rerank(rerankRequest);

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
