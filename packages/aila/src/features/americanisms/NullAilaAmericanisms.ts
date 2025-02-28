import type { AilaAmericanismsFeature } from ".";
import type { AilaDocumentContent } from "./AilaAmericanisms";

export class NullAilaAmericanisms implements AilaAmericanismsFeature {
  public findAmericanisms<T extends AilaDocumentContent>() {
    return [];
  }
}
