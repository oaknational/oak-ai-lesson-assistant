import createClient from "openapi-fetch";

import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import type { paths } from "@oakai/core/src/generated/moderation-api";
import { aiLogger } from "@oakai/logger";

import { AilaModerationError, AilaModerator } from ".";

const log = aiLogger("aila:moderation");

/**
 * Fetches a Vercel OIDC token for authenticating with the moderation API.
 * Only works in Vercel deployments where OIDC environment variables are available.
 */
async function getVercelOIDCToken(): Promise<string> {
  const tokenUrl = process.env.VERCEL_OIDC_TOKEN_URL;
  const token = process.env.VERCEL_OIDC_TOKEN;

  if (!tokenUrl || !token) {
    throw new AilaModerationError(
      "Vercel OIDC environment variables not available. " +
        "Ensure VERCEL_OIDC_TOKEN_URL and VERCEL_OIDC_TOKEN are set (automatic in Vercel deployments).",
    );
  }

  const response = await fetch(`${tokenUrl}?audience=https://oidc.vercel.com`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new AilaModerationError(
      `Failed to get Vercel OIDC token: ${response.status}`,
    );
  }

  const data = (await response.json()) as { token: string };
  return data.token;
}

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
  private cachedToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(config: OakModerationServiceModeratorConfig) {
    super({ userId: config.userId, chatId: config.chatId });
    this.baseUrl = config.baseUrl;
    this.timeoutMs = config.timeoutMs ?? 30000;
  }

  /**
   * Gets an OIDC token, using a cached value if still valid.
   * Tokens are refreshed when they expire or are within 5 minutes of expiring.
   */
  private async getToken(): Promise<string> {
    const now = Date.now();
    const bufferMs = 5 * 60 * 1000; // 5 minutes buffer

    if (this.cachedToken && now < this.tokenExpiresAt - bufferMs) {
      return this.cachedToken;
    }

    log.info("Fetching new Vercel OIDC token");
    this.cachedToken = await getVercelOIDCToken();
    // Tokens typically last 1 hour, set expiry to 55 minutes to be safe
    this.tokenExpiresAt = now + 55 * 60 * 1000;
    return this.cachedToken;
  }

  private async createAuthenticatedClient(): Promise<
    ReturnType<typeof createClient<paths>>
  > {
    const token = await this.getToken();
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
          // Token may have expired or be invalid, clear cache to force refresh
          this.cachedToken = null;
          this.tokenExpiresAt = 0;
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
