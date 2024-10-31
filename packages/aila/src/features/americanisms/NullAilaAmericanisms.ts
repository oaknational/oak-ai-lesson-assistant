import type { AilaAmericanismsFeature } from ".";

export class NullAilaAmericanisms implements AilaAmericanismsFeature {
  public findAmericanisms() {
    return [];
  }
}
