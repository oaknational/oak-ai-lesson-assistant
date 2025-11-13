import {
  LakeraClient,
  type LakeraGuardResponse,
  type Message,
} from "@oakai/core/src/threatDetection/lakera";
import { aiLogger } from "@oakai/logger";

const log = aiLogger("teaching-materials-threat-detection");

// Re-export types for backward compatibility
export type {
  Message,
  LakeraGuardResponse,
} from "@oakai/core/src/threatDetection/lakera";

/**
 * Perform threat detection check using Lakera Guard API
 *
 * @param messages - Array of messages to check for threats
 * @param projectId - Optional project ID (defaults to LAKERA_GUARD_PROJECT_ID_ADDITIONAL_RESOURCES env var)
 * @param apiKey - Optional API key (defaults to LAKERA_GUARD_API_KEY env var)
 * @param URL - Optional API URL (defaults to LAKERA_GUARD_URL env var or https://api.lakera.ai/v2/guard)
 * @returns Promise resolving to LakeraGuardResponse
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
}): Promise<LakeraGuardResponse> {
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
  const result = await client.checkMessages(messages);

  log.info("Lakera threat check completed", {
    flagged: result.flagged,
    breakdownCount: result.breakdown?.length ?? 0,
    payloadCount: result.payload?.length ?? 0,
  });

  return result;
}
