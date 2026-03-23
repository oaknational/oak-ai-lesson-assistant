import {
  LakeraClient,
  type Message,
  toLakeraThreatDetectionResult,
} from "@oakai/core/src/threatDetection/lakera";
import { aiLogger } from "@oakai/logger";

import { z } from "zod";

import { extractPromptTextFromMessages } from "../../../../utils/extractPromptTextFromMessages";
import {
  AilaThreatDetector,
  type ThreatDetectionResult,
} from "../AilaThreatDetector";

const log = aiLogger("aila:threat");

export class LakeraThreatDetector extends AilaThreatDetector {
  private readonly lakeraClient: LakeraClient;

  constructor() {
    super();
    const apiKey = process.env.LAKERA_GUARD_API_KEY;
    const projectId = process.env.LAKERA_GUARD_PROJECT_ID;
    const apiUrl = process.env.LAKERA_GUARD_URL;

    if (!apiKey)
      throw new Error("LAKERA_GUARD_API_KEY environment variable not set");

    this.lakeraClient = new LakeraClient({
      apiKey,
      projectId,
      apiUrl,
    });
  }

  protected async authenticate(): Promise<void> {
    // Authentication is handled via API key in headers
    return Promise.resolve();
  }

  async detectThreat(content: unknown): Promise<ThreatDetectionResult> {
    log.info("Detecting threat", {
      contentType: typeof content,
      isArray: Array.isArray(content),
      length: Array.isArray(content) ? content.length : 0,
    });

    if (
      !Array.isArray(content) ||
      !content.every((msg) => this.isMessage(msg))
    ) {
      log.error("Invalid input format", { content });
      throw new Error("Input must be an array of Messages");
    }

    const data = await this.lakeraClient.checkMessages(
      extractPromptTextFromMessages(content),
    );

    return toLakeraThreatDetectionResult(data);
  }

  private isMessage(msg: unknown): msg is Message {
    return z
      .object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string(),
      })
      .safeParse(msg).success;
  }

  async isThreatError(): Promise<boolean> {
    return Promise.resolve(false);
  }
}
