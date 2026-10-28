import { createDetectionServiceClient } from "@oakai/core/src/threatDetection/detectionService";
import type {
  ThreatDetectionMessage,
  ThreatDetectionResult,
} from "@oakai/core/src/threatDetection/types";
import { aiLogger } from "@oakai/logger";

const log = aiLogger("teaching-materials-threat-detection");

interface DetectionServiceThreatCheckParams {
  messages: ThreatDetectionMessage[];
}

function getPromptToCheck(
  messages: ThreatDetectionMessage[],
): string | undefined {
  return messages.findLast((message) => message.role === "user")?.content;
}

/**
 * The standalone Threat Detection Service, for teaching materials. The same
 * client the chat detector uses; only the prompt extraction differs, which
 * mirrors how the Model Armor check sits beside its detector.
 */
export async function performDetectionServiceThreatCheck({
  messages,
}: DetectionServiceThreatCheckParams): Promise<ThreatDetectionResult> {
  const prompt = getPromptToCheck(messages);
  if (!prompt) {
    return {
      provider: "detection_service",
      isThreat: false,
      message: "No threats detected",
      findings: [],
      details: {},
    };
  }

  const result = await createDetectionServiceClient().detect(prompt);

  log.info("Detection service threat check completed", {
    flagged: result.isThreat,
  });

  return result;
}
