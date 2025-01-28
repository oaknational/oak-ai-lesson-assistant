import { CohereClient } from "cohere-ai";

import type { DocumentReranker, SimplifiedResult } from "./interfaces";

export class CohereReranker implements DocumentReranker {
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
  ) {
    // add in other reranking methods here.
    // conforming to https://github.com/cohere-ai/cohere-typescript/blob/2e1c087ed0ec7eacd39ad062f7293fb15e453f33/src/api/client/requests/RerankRequest.ts#L15
    try {
      const jsonDocs = docs.map((doc) =>
        JSON.stringify({
          text: doc.text,
          custom_id: doc.custom_id,
        }),
      );
      // this should have na error below - https://github.com/cohere-ai/cohere-typescript/blob/499bde51cee5d1f2ea2068580f938123297515f9/src/api/client/requests/RerankRequest.ts#L31
      const response = await this.cohere.rerank({
        model: "rerank-english-v2.0",
        query: query,
        documents: jsonDocs,
        topN: topN,
        //@ts-ignore issue with cohere client - will need version bumping in future.
        rankFields: ["text"],
        returnDocuments: true,
      });

      console.log("Ranked documents:");
      console.log(response.results);
      return response.results;
    } catch (error) {
      console.error("Error during reranking:", error);
      return [];
    }
  }
}

export class ReplicateReranker implements DocumentReranker {
  public async rerankDocuments(
    query: string,
    docs: SimplifiedResult[],
    _topN: number = 10,
  ) {
    // TODO: GCLOMAX - we need to retrain rerankers due to embedding changes.
    throw new Error("Not implemented");
    return Promise.resolve([]);
  }
}
