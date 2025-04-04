import { AilaPersistence } from "../..";
import type {
  AilaChatService,
  AilaServices,
} from "../../../../core/AilaServices";
import type { AilaGeneration } from "../../../generation/AilaGeneration";

export class AilaFilePersistence extends AilaPersistence {
  constructor({ aila, chat }: { aila: AilaServices; chat: AilaChatService }) {
    super({ aila, chat, name: "AilaFilePersistence" });
  }

  async upsertChat(): Promise<void> {
    // Implementation goes here
    return Promise.reject(new Error("Not implemented"));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async upsertGeneration(generation?: AilaGeneration): Promise<void> {
    // Implementation goes here
    return Promise.reject(new Error("Not implemented"));
  }

  async loadChat(): Promise<null> {
    // Implementation goes here
    return Promise.reject(new Error("Not implemented"));
  }
}
