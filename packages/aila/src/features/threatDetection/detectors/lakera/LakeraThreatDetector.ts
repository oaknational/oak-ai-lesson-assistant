import {
  LakeraClient,
  toLakeraThreatDetectionResult,
} from "@oakai/core/src/threatDetection/lakera";
import { aiLogger } from "@oakai/logger";

import { extractPromptTextFromMessages } from "../../../../utils/extractPromptTextFromMessages";
import {
  AilaThreatDetector,
  type ThreatDetectionMessage,
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

  async detectThreat(
    content: ThreatDetectionMessage[],
  ): Promise<ThreatDetectionResult> {
    log.info("Detecting threat", {
      length: content.length,
    });

    const data = await this.lakeraClient.checkMessages(
      extractPromptTextFromMessages(content),
    );

    return toLakeraThreatDetectionResult(data);
  }
}
