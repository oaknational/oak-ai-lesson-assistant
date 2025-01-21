import type { CohereClient } from "cohere-ai";

import type { RagLessonPlanResult } from "../types";
import { rerankResults } from "./rerank";

describe("rerankResults", () => {
  it("should rerank results based on cohere's relevanceScore", async () => {
    const cohereClient = {
      rerank: jest.fn().mockResolvedValue({
        results: [
          {
            index: 0,
            relevanceScore: 0.4,
          },
          {
            index: 1,
            relevanceScore: 0.9,
          },
          {
            index: 2,
            relevanceScore: 0.5,
          },
        ],
      }),
    };
    const query = "query";
    const results = [
      {
        lesson_plan: 0,
      },
      {
        lesson_plan: 1,
      },
      {
        lesson_plan: 2,
      },
    ] as unknown as RagLessonPlanResult[];

    const rerankedResults = await rerankResults({
      cohereClient: cohereClient as unknown as CohereClient,
      query,
      results,
    });

    expect(rerankedResults).toEqual([
      {
        lesson_plan: 1,
      },
      {
        lesson_plan: 2,
      },
      {
        lesson_plan: 0,
      },
    ]);
  });
});
