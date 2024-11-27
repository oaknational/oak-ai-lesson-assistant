import type { BaseQuizGenerator } from "./AilaQuizVariants";
import { AilaRagQuizGenerator } from "./AilaRagQuizGenerator";
import { BasedOnRagQuizGenerator } from "./BasedOnRagQuizGenerator";
import { MLQuizGenerator } from "./MLQuizGenerator";

// Factory class

export class AilaQuizFactory {
  static createQuizGenerator(
    type: "rag" | "ml" | "basedOnRag",
  ): BaseQuizGenerator {
    switch (type) {
      case "rag":
        return new AilaRagQuizGenerator();
      case "ml":
        return new MLQuizGenerator();
      case "basedOnRag":
        return new BasedOnRagQuizGenerator();
      default:
        throw new Error(`Unknown quiz generator type: ${type}`);
    }
  }
}
