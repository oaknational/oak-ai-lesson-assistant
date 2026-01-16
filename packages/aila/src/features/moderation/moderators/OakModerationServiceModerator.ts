import type { paths } from "@oakai/core/src/generated/moderation-api";
import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { aiLogger } from "@oakai/logger";

import { getVercelOidcToken } from "@vercel/oidc";
import createClient from "openapi-fetch";

import { AilaModerationError, AilaModerator } from ".";

const log = aiLogger("aila:moderation");

export interface OakModerationServiceModeratorConfig {
  baseUrl: string;
  chatId: string;
  userId?: string;
  timeoutMs?: number;
}

/**
 * Moderator implementation that calls the Oak AI Moderation Service.
 * Uses Vercel OIDC tokens for authentication and openapi-fetch with
 * generated types from the OpenAPI spec.
 */
export class OakModerationServiceModerator extends AilaModerator {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(config: OakModerationServiceModeratorConfig) {
    super({ userId: config.userId, chatId: config.chatId });
    this.baseUrl = config.baseUrl;
    this.timeoutMs = config.timeoutMs ?? 30000;
  }

  /**
   * Creates an authenticated OpenAPI client using Vercel OIDC token.
   * The @vercel/oidc package handles token fetching and caching internally.
   */
  private async createAuthenticatedClient(): Promise<
    ReturnType<typeof createClient<paths>>
  > {
    const token = await getVercelOidcToken();
    return createClient<paths>({
      baseUrl: this.baseUrl,
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
      const { data, error, response } = await client.POST("/v0/moderate", {
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

      log.info("Oak Moderation Service response received", {
        categoriesCount: data.categories.length,
        scores: data.scores,
      });

      return {
        justification: data.message,
        scores: data.scores,
        categories: data.categories,
      };
    } catch (err) {
      if (err instanceof AilaModerationError) {
        throw err;
      }
      log.error("Oak Moderation Service error", err);
      throw new AilaModerationError(
        `Oak Moderation Service failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}
