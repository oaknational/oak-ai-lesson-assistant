import { Client } from "@elastic/elasticsearch";
import { CohereClient } from "cohere-ai";
import type { z } from "zod";

import type { JsonPatchDocument } from "../../protocol/jsonPatchProtocol";
import type {
  LooseLessonPlan,
  QuizQuestion,
  QuizPath,
} from "../../protocol/schema";
import type { AilaQuizService } from "../AilaServices";
import { CohereReranker } from "./rerankers";

// Base abstract class
export abstract class BaseQuizGenerator implements AilaQuizService {
  protected client: Client;
  protected cohere: CohereClient;
  protected rerankService: CohereReranker;

  constructor() {
    this.client = new Client({
      cloud: { id: process.env.I_DOT_AI_ELASTIC_CLOUD_ID as string },
      auth: { apiKey: process.env.I_DOT_AI_ELASTIC_KEY as string },
    });

    this.cohere = new CohereClient({
      token: process.env.COHERE_API_KEY as string,
    });

    // This should be changed to use our hosted models
    this.rerankService = new CohereReranker();
  }

  abstract generateMathsStarterQuizPatch(
    lessonPlan: LooseLessonPlan,
  ): Promise<JsonPatchDocument>;
  abstract generateMathsExitQuizPatch(
    lessonPlan: LooseLessonPlan,
  ): Promise<JsonPatchDocument>;
}

// RAG-based Quiz Generator
export class RagQuizGenerator extends BaseQuizGenerator {
  async generateMathsQuizFromRagPlanId(
    planId: string,
  ): Promise<JsonPatchDocument> {
    // Implementation for RAG-based quiz generation
  }
  // ... other implementations
}

// ML-based Quiz Generator
export class MLQuizGenerator extends BaseQuizGenerator {
  async generateMathsQuizML(
    lessonPlan: LooseLessonPlan,
  ): Promise<QuizQuestion[]> {
    // Implementation for ML-based quiz generation
  }
  // ... other implementations
}

// Combined Approach Quiz Generator
export class CombinedQuizGenerator extends BaseQuizGenerator {
  async combinedRerankingOpenAIMLQuizGeneration<T extends z.ZodType>(
    lessonPlan: LooseLessonPlan,
    ratingSchema: T,
    quizType: QuizPath,
  ): Promise<QuizQuestion[]> {
    // Implementation for combined approach
  }
  // ... other implementations
}

// Factory class
export class AilaQuizFactory {
  static createQuizGenerator(
    type: "rag" | "ml" | "combined",
  ): BaseQuizGenerator {
    switch (type) {
      case "rag":
        return new RagQuizGenerator();
      case "ml":
        return new MLQuizGenerator();
      case "combined":
        return new CombinedQuizGenerator();
      default:
        throw new Error(`Unknown quiz generator type: ${type}`);
    }
  }
}
