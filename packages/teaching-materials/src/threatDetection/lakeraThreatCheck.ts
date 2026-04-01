import {
  LakeraClient,
  type Message,
  toLakeraThreatDetectionResult,
} from "@oakai/core/src/threatDetection/lakera";
import type { ThreatDetectionResult } from "@oakai/core/src/threatDetection/types";
import { aiLogger } from "@oakai/logger";

const log = aiLogger("teaching-materials-threat-detection");

// Re-export types for backward compatibility
export type { Message } from "@oakai/core/src/threatDetection/lakera";

/**
 * Perform threat detection check using Lakera Guard API
 *
 * @param messages - Array of messages to check for threats
 * @param projectId - Optional project ID (defaults to LAKERA_GUARD_PROJECT_ID_ADDITIONAL_RESOURCES env var)
 * @param apiKey - Optional API key (defaults to LAKERA_GUARD_API_KEY env var)
 * @param URL - Optional API URL (defaults to LAKERA_GUARD_URL env var or https://api.lakera.ai/v2/guard)
 * @returns Promise resolving to ThreatDetectionResult
 */
export async function performLakeraThreatCheck({
  messages,
  projectId = process.env.LAKERA_GUARD_PROJECT_ID_ADDITIONAL_RESOURCES ??
    process.env.LAKERA_GUARD_PROJECT_ID,
  apiKey = process.env.LAKERA_GUARD_API_KEY,
  URL = process.env.LAKERA_GUARD_URL,
}: {
  messages: Message[];
  projectId?: string;
  apiKey?: string;
  URL?: string;
}): Promise<ThreatDetectionResult> {
  if (!apiKey) {
    log.error("Lakera API key not found");
    throw new Error("Lakera API key not found");
  }

  // Create LakeraClient instance
  const client = new LakeraClient({
    apiKey,
    projectId,
    apiUrl: URL,
  });

  // Use the shared client to check messages
  const rawResponse = await client.checkMessages(messages);
  const threatDetection = toLakeraThreatDetectionResult(rawResponse);

  log.info("Lakera threat check completed", {
    flagged: threatDetection.isThreat,
    requestId: threatDetection.requestId,
    findingsCount: threatDetection.findings.length,
  });

  return threatDetection;
}
