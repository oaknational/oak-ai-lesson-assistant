import { AilaRagQuizGenerator } from "./AilaRagQuizGenerator";
import type { BaseQuizGenerator } from "./BaseQuizGenerator";
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
    }
  }
}
