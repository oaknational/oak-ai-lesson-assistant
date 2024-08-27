import { AilaPersistence } from "../..";
import { AilaChatService, AilaServices } from "../../../../core";
import { AilaGeneration } from "../../../generation";

export class AilaFilePersistence extends AilaPersistence {
  constructor({ aila, chat }: { aila: AilaServices; chat: AilaChatService }) {
    super({ aila, chat, name: "AilaFilePersistence" });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async upsertChat(): Promise<void> {
    // Implementation goes here
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async upsertGeneration(generation?: AilaGeneration): Promise<void> {
    // Implementation goes here
    throw new Error("Not implemented");
  }
}
