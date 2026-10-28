import { aiLogger } from "@oakai/logger";

import { getVercelOidcToken } from "@vercel/oidc";

import type { ThreatDetectionResult } from "../types";
import { detectionServiceResponseSchema } from "./schema";
import { toDetectionServiceThreatDetectionResult } from "./toThreatDetectionResult";

const log = aiLogger("aila:threat");

const REQUEST_TIMEOUT_MS = 15_000;

export interface DetectionServiceClientConfig {
  baseUrl: string;
  /**
   * Staging only. Vercel's Deployment Protection gates the service's
   * non-production domains at the edge, before its code runs, so a request
   * without this never reaches the OIDC check. Production domains are not
   * protected and set no bypass secret — if production ever appears to need
   * one, something is pointed at the wrong environment.
   */
  bypassSecret?: string;
  getOidcToken?: () => Promise<string>;
}

/**
 * Calls the standalone Threat Detection Service over HTTP, rather than talking
 * to Model Armor from inside this repository.
 *
 * Authentication is the deployment's own Vercel OIDC token. The service
 * verifies it against Vercel's JWKS and checks the project named in the subject
 * claim against its own allow-list, so there is no shared secret and nothing to
 * rotate.
 *
 * Lives in core rather than beside either consumer because both the chat
 * detector and the teaching-materials check need it, which is the same reason
 * ModelArmorClient lives here.
 */
export class DetectionServiceClient {
  private readonly baseUrl: string;
  private readonly bypassSecret: string | undefined;
  private readonly getOidcToken: () => Promise<string>;

  constructor(config: DetectionServiceClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.bypassSecret = config.bypassSecret;
    this.getOidcToken = config.getOidcToken ?? getVercelOidcToken;
  }

  async detect(prompt: string): Promise<ThreatDetectionResult> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await this.getOidcToken()}`,
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

    // Parsed rather than trusted. The service deploys separately and can change
    // shape without this repository rebuilding, so a parse failure throws —
    // which ends the turn, the same as the service being unreachable, and the
    // right outcome: a response we cannot read is not a verdict.
    const parsed = detectionServiceResponseSchema.parse(await response.json());

    log.info("Detection service responded", {
      isThreat: parsed.is_threat,
      category: parsed.category,
      detectionId: parsed.detection_id,
    });

    return toDetectionServiceThreatDetectionResult(parsed);
  }
}

/** Reads the environment the same way for every consumer. */
export function createDetectionServiceClient(): DetectionServiceClient {
  const baseUrl = process.env.THREAT_DETECTION_API_URL;
  if (!baseUrl) {
    throw new Error("THREAT_DETECTION_API_URL not found");
  }

  return new DetectionServiceClient({
    baseUrl,
    bypassSecret: process.env.THREAT_DETECTION_API_BYPASS_SECRET,
  });
}
