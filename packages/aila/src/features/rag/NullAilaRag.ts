import { AilaRagFeature } from ".";

export class NullAilaRag implements AilaRagFeature {
  public async fetchRagContent() {
    return "";
  }
}
