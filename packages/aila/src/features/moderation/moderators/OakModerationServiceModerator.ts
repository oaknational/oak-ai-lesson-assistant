import createClient from "openapi-fetch";

import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import type { paths } from "@oakai/core/src/generated/moderation-api";
import { aiLogger } from "@oakai/logger";

import { AilaModerationError, AilaModerator } from ".";

const log = aiLogger("aila:moderation");

export interface OakModerationServiceModeratorConfig {
  baseUrl: string;
  apiKey: string;
  chatId: string;
  userId?: string;
  timeoutMs?: number;
}

/**
 * Moderator implementation that calls the Oak AI Moderation Service.
 * Uses openapi-fetch with generated types from the OpenAPI spec.
 */
export class OakModerationServiceModerator extends AilaModerator {
  private readonly client: ReturnType<typeof createClient<paths>>;
  private readonly timeoutMs: number;

  constructor(config: OakModerationServiceModeratorConfig) {
    super({ userId: config.userId, chatId: config.chatId });
    this.client = createClient<paths>({
      baseUrl: config.baseUrl,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
      },
    });
    this.timeoutMs = config.timeoutMs ?? 30000;
  }

  async moderate(input: string): Promise<ModerationResult> {
    log.info("Calling Oak Moderation Service", {
      contentLength: input.length,
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const { data, error, response } = await this.client.POST("/v0/moderate", {
        body: { content: input },
        signal: controller.signal,
      });

      if (error) {
        log.error("Oak Moderation Service error", {
          status: response.status,
          error,
        });
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
