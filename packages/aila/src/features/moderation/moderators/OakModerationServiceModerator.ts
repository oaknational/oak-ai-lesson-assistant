import type { paths } from "@oakai/core/src/generated/moderation-api";
import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { aiLogger } from "@oakai/logger";

import { getVercelOidcToken } from "@vercel/oidc";
import createClient from "openapi-fetch";

import thresholdsConfig from "../moderationThresholdsOakService.json";
import { AilaModerationError, AilaModerator } from "./AilaModerator";

const log = aiLogger("aila:moderation");

const thresholds: Record<string, number> = thresholdsConfig.thresholds;

function isCategoryFlagged(code: string, score: number): boolean {
  const threshold = thresholds[code] ?? thresholdsConfig.defaultThreshold;
  return score < threshold;
}

export interface OakModerationServiceModeratorConfig {
  baseUrl: string;
  chatId: string;
  userId?: string;
  timeoutMs?: number;
  protectionBypassSecret?: string;
}

/**
 * Moderator implementation that calls the Oak AI Moderation Service.
 * Uses Vercel OIDC tokens for authentication and openapi-fetch with
 * generated types from the OpenAPI spec.
 * Returns 24 sub-category scores (1-5 Likert, 5 = safe).
 * Categories are flagged when their score falls below a per-category
 * threshold defined in moderationThresholdsOakService.json.
 */
export class OakModerationServiceModerator extends AilaModerator {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly protectionBypassSecret?: string;

  constructor(config: OakModerationServiceModeratorConfig) {
    super({ userId: config.userId, chatId: config.chatId });
    this.baseUrl = config.baseUrl;
    this.timeoutMs = config.timeoutMs ?? 30000;
    this.protectionBypassSecret = config.protectionBypassSecret;
  }

  /**
   * Creates an OpenAPI client, authenticated with Vercel OIDC when available.
   * OIDC tokens are only available in Vercel serverless functions;
   * non-production environments bypass auth so the token is optional.
   */
  private async createAuthenticatedClient(): Promise<
    ReturnType<typeof createClient<paths>>
  > {
    const headers: Record<string, string> = {};
    try {
      const token = await getVercelOidcToken();
      headers["Authorization"] = `Bearer ${token}`;
    } catch {
      log.info("No Vercel OIDC token available, calling without auth");
    }
    if (this.protectionBypassSecret) {
      headers["x-vercel-protection-bypass"] = this.protectionBypassSecret;
    }
    return createClient<paths>({
      baseUrl: this.baseUrl,
      headers,
    });
  }

  async moderate(input: string): Promise<ModerationResult> {
    log.info("Calling Oak Moderation Service", {
      contentLength: input.length,
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const client = await this.createAuthenticatedClient();
      const { data, error, response } = await client.POST("/v1/moderate", {
        body: { content: input },
        signal: controller.signal,
      });

      if (error) {
        log.error("Oak Moderation Service error", {
          status: response.status,
          error,
        });

        if (response.status === 401) {
          throw new AilaModerationError(
            "Authentication failed - OIDC token is invalid or expired",
          );
        }

        if (response.status === 403) {
          throw new AilaModerationError(
            "Project not authorized - ensure your Vercel project ID is in the moderation API allowlist",
          );
        }

        throw new AilaModerationError(
          `Oak Moderation Service returned ${response.status}: ${error.error}`,
        );
      }

      const categories = Object.entries(data.scores)
        .filter(([code, score]) => isCategoryFlagged(code, score))
        .map(([code]) => code) as ModerationResult["categories"];

      log.info("Oak Moderation Service response received", {
        categoriesCount: categories.length,
        moderationId: data.moderation_id,
        promptVersion: data.prompt_version,
      });

      return {
        scores: data.scores,
        categories,
      };
    } catch (err) {
      if (err instanceof AilaModerationError) {
        throw err;
      }
      log.error("Oak Moderation Service error", err);
      throw new AilaModerationError("Oak Moderation Service failed", {
        cause: err,
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}
