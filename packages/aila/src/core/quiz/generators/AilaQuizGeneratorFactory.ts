import type { BaseQuizGenerator } from "./BaseQuizGenerator";
import { BasedOnRagQuizGenerator } from "./BasedOnRagQuizGenerator";

// Factory class

export class AilaQuizFactory {
  static createQuizGenerator(
    type: "rag" | "ml" | "basedOnRag",
  ): BaseQuizGenerator {
    switch (type) {
      case "rag":
        throw new Error("RAG quiz generator not implemented");
      case "ml":
        throw new Error("ML quiz generator not implemented");
      case "basedOnRag":
        return new BasedOnRagQuizGenerator();
    }
  }
}
