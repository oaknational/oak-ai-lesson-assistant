import {
  ModelArmorClient,
  createModelArmorAccessTokenProvider,
  toModelArmorThreatDetectionResult,
} from "@oakai/core/src/threatDetection/modelArmor";
import type {
  ThreatDetectionMessage,
  ThreatDetectionResult,
} from "@oakai/core/src/threatDetection/types";
import { aiLogger } from "@oakai/logger";

const log = aiLogger("teaching-materials-threat-detection");

interface ModelArmorThreatCheckParams {
  messages: ThreatDetectionMessage[];
  projectId?: string;
  location?: string;
  defaultTemplateId?: string;
}

function getPromptToCheck(
  messages: ThreatDetectionMessage[],
): string | undefined {
  return messages.findLast((message) => message.role === "user")?.content;
}

export async function performModelArmorThreatCheck({
  messages,
  projectId = process.env.MODEL_ARMOR_PROJECT_ID,
  location = process.env.MODEL_ARMOR_LOCATION,
  defaultTemplateId = process.env.MODEL_ARMOR_TEMPLATE_ID,
}: ModelArmorThreatCheckParams): Promise<ThreatDetectionResult> {
  if (!projectId) {
    throw new Error("MODEL_ARMOR_PROJECT_ID not found");
  }

  if (!location) {
    throw new Error("MODEL_ARMOR_LOCATION not found");
  }

  if (!defaultTemplateId) {
    throw new Error("MODEL_ARMOR_TEMPLATE_ID not found");
  }

  const client = new ModelArmorClient({
    defaultTemplateId,
    getAccessToken: createModelArmorAccessTokenProvider(),
    projectId,
    location,
  });

  const prompt = getPromptToCheck(messages);
  if (!prompt) {
    return {
      provider: "model_armor",
      isThreat: false,
      message: "No threats detected",
      findings: [],
      details: {},
    };
  }

  const response = await client.sanitizeUserPrompt(prompt);

  log.info("Model Armor threat check completed", {
    flagged: response.sanitizationResult.filterMatchState === "MATCH_FOUND",
  });

  return toModelArmorThreatDetectionResult(response, prompt);
}
