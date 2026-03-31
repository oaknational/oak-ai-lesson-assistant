import type { paths } from "../../generated/moderation-api";
import type { ModerationResult } from "./moderationSchema";

import { aiLogger } from "@oakai/logger";
import { getVercelOidcToken } from "@vercel/oidc";
import createClient from "openapi-fetch";

const log = aiLogger("moderation:oak-service");

export interface OakModerationServiceConfig {
  baseUrl: string;
  timeoutMs?: number;
  protectionBypassSecret?: string;
}

export class OakModerationServiceError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "OakModerationServiceError";
  }
}

/**
 * Calls the Oak AI Moderation Service HTTP API.
 * Returns flagged categories and per-category scores.
 *
 * Authentication uses Vercel OIDC tokens when available (serverless);
 * non-production environments can bypass auth.
 */
export async function moderateWithOakService(
  content: string,
  config: OakModerationServiceConfig,
): Promise<ModerationResult> {
  const { baseUrl, timeoutMs = 30_000, protectionBypassSecret } = config;

  // Try to get a Vercel OIDC token; gracefully continue without one
  const headers: Record<string, string> = {};
  try {
    const token = await getVercelOidcToken();
    headers["Authorization"] = `Bearer ${token}`;
  } catch {
    log.info("No Vercel OIDC token available, calling without auth");
  }
  if (protectionBypassSecret) {
    headers["x-vercel-protection-bypass"] = protectionBypassSecret;
  }

  // Create a type-safe HTTP client using generated OpenAPI types
  const client = createClient<paths>({ baseUrl, headers });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const { data, error, response } = await client.POST("/v1/moderate", {
      body: { content },
      signal: controller.signal,
    });

    if (error) {
      if (response.status === 401) {
        throw new OakModerationServiceError(
          "Authentication failed - OIDC token is invalid or expired",
        );
      }
      if (response.status === 403) {
        throw new OakModerationServiceError(
          "Project not authorized - ensure your Vercel project ID is in the moderation API allowlist",
        );
      }
      throw new OakModerationServiceError(
        `Oak Moderation Service returned ${response.status}: ${error.error}`,
      );
    }

    log.info("Oak Moderation Service response received", {
      categoriesCount: data.flagged_categories.length,
      moderationId: data.moderation_id,
    });

    return {
      scores: data.scores,
      categories: data.flagged_categories as ModerationResult["categories"],
    };
  } catch (err) {
    if (err instanceof OakModerationServiceError) throw err;
    throw new OakModerationServiceError("Oak Moderation Service failed", {
      cause: err,
    });
  } finally {
    clearTimeout(timeout); // always cancel the timeout timer
  }
}
