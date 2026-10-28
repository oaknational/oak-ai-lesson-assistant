import {
  type DetectionServiceClient,
  createDetectionServiceClient,
} from "@oakai/core/src/threatDetection/detectionService";
import type {
  ThreatDetectionMessage,
  ThreatDetectionResult,
} from "@oakai/core/src/threatDetection/types";
import { aiLogger } from "@oakai/logger";

import { extractPromptTextFromMessages } from "../../../../utils/extractPromptTextFromMessages";
import type { AilaThreatDetector } from "../AilaThreatDetector";

const log = aiLogger("aila:threat");

/**
 * Calls the standalone Threat Detection Service instead of talking to Model
 * Armor from inside this repository. The HTTP client lives in core, so the
 * teaching-materials check uses the same one.
 */
export class DetectionServiceThreatDetector implements AilaThreatDetector {
  private readonly client: DetectionServiceClient;

  constructor() {
    this.client = createDetectionServiceClient();
  }

  async detectThreat(
    content: ThreatDetectionMessage[],
  ): Promise<ThreatDetectionResult> {
    log.info("Detecting threat with the detection service", {
      length: content.length,
    });

    const extractedMessages = extractPromptTextFromMessages(content);
    const prompt = this.getPromptToCheck(extractedMessages);
    if (!prompt) {
      return {
        provider: "detection_service",
        isThreat: false,
        message: "No threats detected",
        findings: [],
        details: {},
      };
    }

    return this.client.detect(prompt);
  }

  private getPromptToCheck(
    messages: ThreatDetectionMessage[],
  ): string | undefined {
    return messages.findLast((message) => message.role === "user")?.content;
  }
}
