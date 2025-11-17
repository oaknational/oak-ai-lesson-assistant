import { aiLogger } from "@oakai/logger";

import { CohereClient } from "cohere-ai";
import type {
  RerankRequestDocumentsItem,
  RerankResponse,
  RerankResponseResultsItem,
} from "cohere-ai/api/types";

import type { SimplifiedResult } from "../interfaces";

const log = aiLogger("quiz");

// Cohere's document type only includes 'text', but at runtime it preserves
// all fields we send. We include questionUid for later retrieval.
type DocumentWithQuestionUid = { text: string; questionUid: string };

type RerankResultWithQuestionUid = RerankResponseResultsItem & {
  document: DocumentWithQuestionUid;
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
  ): Promise<RerankResultWithQuestionUid[]> {
    if (docs.length === 0) {
      log.error("No documents to rerank");
      return [];
    }

    try {
      const cohereDocuments: DocumentWithQuestionUid[] = docs.map((doc) => ({
        text: doc.text,
        questionUid: doc.questionUid,
      }));

      const response = (await this.cohere.rerank({
        model: "rerank-v3.5",
        query: query,
        documents: cohereDocuments,
        topN: topN,
        rankFields: ["text"],
        returnDocuments: true,
      })) as RerankResponse & { results: RerankResultWithQuestionUid[] };

      log.info("Ranked documents:", response.results);
      return response.results;
    } catch (error) {
      log.error("Error during reranking:", error);
      return [];
    }
  }
}
