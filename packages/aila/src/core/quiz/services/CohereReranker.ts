import { aiLogger } from "@oakai/logger";

import { CohereClient } from "cohere-ai";
import { z } from "zod";

import type { SimplifiedResult } from "../interfaces";

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

  public async rerankDocuments(
    query: string,
    docs: SimplifiedResult[],
    topN: number = 10,
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

      const response = await this.cohere.rerank({
        model: "rerank-v3.5",
        query: query,
        documents: cohereDocuments,
        topN: topN,
        rankFields: ["text"],
        returnDocuments: true,
      });

      const results: RerankResult[] = response.results.map((result) => ({
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
