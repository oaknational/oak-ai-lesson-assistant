import { aiLogger } from "@oakai/logger";

import type { LakeraGuardResponse, Message } from "./schema";
import { lakeraGuardRequestSchema, lakeraGuardResponseSchema } from "./schema";

const log = aiLogger("lakera-client");

/**
 * Configuration for the LakeraClient
 */
export interface LakeraClientConfig {
  /**
   * Lakera Guard API key (required)
   */
  apiKey: string;

  /**
   * Lakera project ID (optional)
   * If provided, will be included in the request
   */
  projectId?: string;

  /**
   * Custom API URL (optional)
   * Defaults to https://api.lakera.ai/v2/guard
   */
  apiUrl?: string;
}

/**
 * Client for interacting with the Lakera Guard API
 *
 * Lakera Guard is a security API that detects threats in text,
 * including prompt injection, jailbreaks, PII, and other security issues.
 *
 * @example
 * ```typescript
 * const client = new LakeraClient({
 *   apiKey: process.env.LAKERA_GUARD_API_KEY!,
 *   projectId: process.env.LAKERA_GUARD_PROJECT_ID,
 * });
 *
 * const result = await client.checkMessages([
 *   { role: "user", content: "Hello, how are you?" }
 * ]);
 *
 * if (result.flagged) {
 *   console.log("Threat detected:", result.breakdown);
 * }
 * ```
 */
export class LakeraClient {
  private readonly apiKey: string;
  private readonly projectId?: string;
  private readonly apiUrl: string;

  /**
   * Creates a new LakeraClient instance
   *
   * @param config - Configuration for the client
   * @throws {Error} If API key is not provided
   */
  constructor(config: LakeraClientConfig) {
    if (!config.apiKey) {
      throw new Error("Lakera API key is required");
    }

    this.apiKey = config.apiKey;
    this.projectId = config.projectId;
    this.apiUrl = config.apiUrl ?? "https://api.lakera.ai/v2/guard";

    log.info("LakeraClient initialized", {
      apiUrl: this.apiUrl,
      hasProjectId: !!this.projectId,
    });
  }

  /**
   * Check messages for threats using Lakera Guard API
   *
   * @param messages - Array of messages to check
   * @returns Promise resolving to LakeraGuardResponse
   * @throws {Error} If API request fails or response is invalid
   */
  async checkMessages(messages: Message[]): Promise<LakeraGuardResponse> {
    const requestBody = {
      messages,
      ...(this.projectId && { project_id: this.projectId }),
      payload: true,
      breakdown: true,
    };

    // Validate request body
    const parsedBody = lakeraGuardRequestSchema.parse(requestBody);

    log.info("Lakera API request", {
      url: this.apiUrl,
      projectId: this.projectId,
      messageCount: messages.length,
      messages: messages.map((m) => ({
        role: m.role,
        contentLength: m.content.length,
        contentPreview: m.content.slice(0, 100),
      })),
    });

    // Make API request
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(parsedBody),
    });

    const responseData = await response.json();

    // Check for HTTP errors
    if (!response.ok) {
      log.error("Lakera API error", {
        status: response.status,
        statusText: response.statusText,
        responseBody: responseData,
        requestBody: parsedBody,
      });
      throw new Error(
        `Lakera API error: ${response.status} ${response.statusText}`,
      );
    }

    // Validate response
    const parsed = lakeraGuardResponseSchema.parse(responseData);

    log.info("Lakera API response", {
      flagged: parsed.flagged,
      breakdownCount: parsed.breakdown?.length ?? 0,
      payloadCount: parsed.payload?.length ?? 0,
      hasDevInfo: !!parsed.dev_info,
    });

    return parsed;
  }
}
