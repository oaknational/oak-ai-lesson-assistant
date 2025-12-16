import type { AilaQuizCandidateGenerator } from "../interfaces";
import { AilaRagQuizGenerator } from "./AilaRagQuizGenerator";
import { BasedOnRagQuizGenerator } from "./BasedOnRagQuizGenerator";
import { MLQuizGenerator } from "./MLQuizGenerator";
import { MLQuizGeneratorMultiTerm } from "./MLQuizGeneratorMultiTerm";

// Factory class

export class AilaQuizFactory {
  static createQuizGenerator(
    type: "rag" | "ml" | "mlMultiTerm" | "basedOnRag",
  ): AilaQuizCandidateGenerator {
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
