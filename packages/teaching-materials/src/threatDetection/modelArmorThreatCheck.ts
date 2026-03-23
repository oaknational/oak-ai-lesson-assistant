import {
  ModelArmorClient,
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
  credentialsJson?: string;
  projectId?: string;
  location?: string;
  templateId?: string;
  apiBaseUrl?: string;
}

function buildPrompt(messages: ThreatDetectionMessage[]): string {
  return messages
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");
}

export async function performModelArmorThreatCheck({
  messages,
  credentialsJson = process.env.GOOGLE_EXTERNAL_ACCOUNT_CREDENTIALS_JSON,
  projectId = process.env.MODEL_ARMOR_PROJECT_ID,
  location = process.env.MODEL_ARMOR_LOCATION,
  templateId = process.env.MODEL_ARMOR_TEMPLATE_ID,
  apiBaseUrl = process.env.MODEL_ARMOR_API_BASE_URL,
}: ModelArmorThreatCheckParams): Promise<ThreatDetectionResult> {
  if (!credentialsJson) {
    log.error("Model Armor external account credentials not found");
    throw new Error("GOOGLE_EXTERNAL_ACCOUNT_CREDENTIALS_JSON not found");
  }

  if (!projectId) {
    throw new Error("MODEL_ARMOR_PROJECT_ID not found");
  }

  if (!location) {
    throw new Error("MODEL_ARMOR_LOCATION not found");
  }

  if (!templateId) {
    throw new Error("MODEL_ARMOR_TEMPLATE_ID not found");
  }

  const client = new ModelArmorClient({
    credentialsJson,
    projectId,
    location,
    templateId,
    apiBaseUrl,
  });

  const prompt = buildPrompt(messages);
  const response = await client.sanitizeUserPrompt(prompt);

  log.info("Model Armor threat check completed", {
    flagged: response.sanitizationResult.filterMatchState === "MATCH_FOUND",
    requestId: response.requestId,
  });

  return toModelArmorThreatDetectionResult(response, prompt);
}
