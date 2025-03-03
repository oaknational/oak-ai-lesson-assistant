import type { AilaAmericanismsFeature } from ".";
import type { AilaDocumentContent } from "./AilaAmericanisms";

export class NullAilaAmericanisms implements AilaAmericanismsFeature {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public findAmericanisms<T extends AilaDocumentContent>(_document: T) {
    return [];
  }
}
