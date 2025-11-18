import { AilaRagQuizGenerator } from "./AilaRagQuizGenerator";
import type { BaseQuizGenerator } from "./BaseQuizGenerator";
import { BasedOnRagQuizGenerator } from "./BasedOnRagQuizGenerator";
import { MLQuizGenerator } from "./MLQuizGenerator";
import { MLQuizGeneratorMultiTerm } from "./MLQuizGeneratorMultiTerm";

// Factory class

export class AilaQuizFactory {
  static createQuizGenerator(
    type: "rag" | "ml" | "mlMultiTerm" | "basedOnRag",
  ): BaseQuizGenerator {
    switch (type) {
      case "rag":
        return new AilaRagQuizGenerator();
      case "ml":
        return new MLQuizGenerator();
      case "mlMultiTerm":
        return new MLQuizGeneratorMultiTerm();
      case "basedOnRag":
        return new BasedOnRagQuizGenerator();
    }
  }
}
