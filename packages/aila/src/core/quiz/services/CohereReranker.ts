import { aiLogger } from "@oakai/logger";

import { CohereClient } from "cohere-ai";
import { z } from "zod";

import type { SimplifiedResult } from "../interfaces";
import type { Span } from "../tracing";

const log = aiLogger("quiz");

// We call Cohere with returnDocuments: true, which lets us pass in custom
// values for each sorted result. The Cohere types don't reflect this so we
// validate it when extracting the response
const cohereResponseSchema = z.object({
  text: z.string(),
  questionUid: z.string(),
});

export type RerankResult = {
  index: number;
  relevanceScore: number;
  questionUid: string;
};

export class CohereReranker {
  private readonly cohere: CohereClient;

  constructor() {
    this.cohere = new CohereClient({
      token: process.env.COHERE_API_KEY as string,
    });
  }

  /**
   * Reranks documents using Cohere's rerank model.
   * @param span - Optional tracing span. When provided, requests all results
   *               from Cohere (not just topN) and records them for debugging.
   */
  public async rerankDocuments(
    query: string,
    docs: SimplifiedResult[],
    topN: number = 10,
    span?: Span,
  ): Promise<RerankResult[]> {
    if (docs.length === 0) {
      log.error("No documents to rerank");
      return [];
    }

    try {
      const cohereDocuments = docs.map((doc) => ({
        text: doc.text,
        questionUid: doc.questionUid,
      }));

      // When tracing, request all results for debug visibility
      const requestTopN = span ? docs.length : topN;

      const response = await this.cohere.rerank({
        model: "rerank-v3.5",
        query: query,
        documents: cohereDocuments,
        topN: requestTopN,
        rankFields: ["text"],
        returnDocuments: true,
      });

      // Record debug data if span is provided
      if (span) {
        span.setData("query", query);
        span.setData("inputCount", docs.length);
        span.setData("topN", topN);
        span.setData(
          "allResults",
          response.results.map((result) => {
            const doc = docs[result.index];
            return {
              questionUid: cohereResponseSchema.parse(result.document)
                .questionUid,
              text: doc?.text ?? "",
              originalIndex: result.index,
              relevanceScore: result.relevanceScore,
            };
          }),
        );
      }

      // Return only topN results
      const results: RerankResult[] = response.results
        .slice(0, topN)
        .map((result) => ({
          index: result.index,
          relevanceScore: result.relevanceScore,
          questionUid: cohereResponseSchema.parse(result.document).questionUid,
        }));

      log.info("Ranked documents:", results);
      return results;
    } catch (error) {
      log.error("Error during reranking:", error);
      return [];
    }
  }

}
