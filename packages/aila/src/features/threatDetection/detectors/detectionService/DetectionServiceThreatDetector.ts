import type {
  ThreatDetectionMessage,
  ThreatDetectionResult,
} from "@oakai/core/src/threatDetection/types";
import { aiLogger } from "@oakai/logger";

import { getVercelOidcToken } from "@vercel/oidc";
import invariant from "tiny-invariant";

import { extractPromptTextFromMessages } from "../../../../utils/extractPromptTextFromMessages";
import type { AilaThreatDetector } from "../AilaThreatDetector";
import { detectionServiceResponseSchema } from "./schema";
import { toDetectionServiceThreatDetectionResult } from "./toThreatDetectionResult";

const log = aiLogger("aila:threat");

const REQUEST_TIMEOUT_MS = 15_000;

/**
 * Calls the standalone Threat Detection Service over HTTP, rather than talking
 * to Model Armor from inside this repository.
 *
 * Authentication is the deployment's own Vercel OIDC token. The service
 * verifies it against Vercel's JWKS and checks the project named in the subject
 * claim against its own allow-list, so no shared secret is involved and nothing
 * has to be rotated.
 *
 * The bypass secret is separate and **staging only**. Vercel's Deployment
 * Protection gates the service's non-production domains at the edge, before its
 * code runs, so a request without it never reaches the OIDC check. Production
 * domains are not protected, so production sets no bypass secret at all — if it
 * ever appears to need one, something is pointed at the wrong environment.
 */
export class DetectionServiceThreatDetector implements AilaThreatDetector {
  private readonly baseUrl: string;
  private readonly bypassSecret: string | undefined;

  constructor() {
    const baseUrl = process.env.THREAT_DETECTION_API_URL;
    invariant(baseUrl, "THREAT_DETECTION_API_URL environment variable not set");

    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.bypassSecret = process.env.THREAT_DETECTION_API_BYPASS_SECRET;
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

    const response = await this.post(prompt);
    const parsed = detectionServiceResponseSchema.parse(response);

    log.info("Detection service responded", {
      isThreat: parsed.is_threat,
      category: parsed.category,
      detectionId: parsed.detection_id,
    });

    return toDetectionServiceThreatDetectionResult(parsed);
  }

  private async post(prompt: string): Promise<unknown> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await getVercelOidcToken()}`,
    };

    if (this.bypassSecret) {
      headers["x-vercel-protection-bypass"] = this.bypassSecret;
    }

    const response = await fetch(`${this.baseUrl}/v1/detect`, {
      method: "POST",
      headers,
      body: JSON.stringify({ content: prompt }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      // Never the body: the service echoes the request on a 400, and this
      // message reaches logs.
      throw new Error(
        `Threat detection service request failed: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }

  private getPromptToCheck(
    messages: ThreatDetectionMessage[],
  ): string | undefined {
    return messages.findLast((message) => message.role === "user")?.content;
  }
}
