import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import {
  OakModerationServiceClient,
  OakModerationServiceError,
  type OakModerationServiceClientConfig,
} from "@oakai/core/src/services/moderation";
import { aiLogger } from "@oakai/logger";

import { AilaModerationError, AilaModerator } from ".";

const log = aiLogger("aila:moderation");

export interface OakModerationServiceModeratorConfig
  extends OakModerationServiceClientConfig {
  userId?: string;
  chatId: string;
}

/**
 * Moderator implementation that uses the Oak AI Moderation Service.
 * This calls the external moderation API and maps the response to the
 * internal ModerationResult format.
 */
export class OakModerationServiceModerator extends AilaModerator {
  private readonly client: OakModerationServiceClient;

  constructor(config: OakModerationServiceModeratorConfig) {
    super({ userId: config.userId, chatId: config.chatId });
    this.client = new OakModerationServiceClient({
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      timeoutMs: config.timeoutMs,
    });
  }

  async moderate(input: string): Promise<ModerationResult> {
    try {
      log.info("Moderating content via Oak Moderation Service");
      const response = await this.client.moderate(input);

      // The response type from openapi-fetch matches the ModerationResult structure
      const result: ModerationResult = {
        justification: response.message,
        scores: response.scores,
        categories: response.categories,
      };

      log.info("Moderation complete", {
        categoriesCount: result.categories.length,
        hasScores: !!result.scores,
      });

      return result;
    } catch (error) {
      log.error("Oak Moderation Service error", error);

      if (error instanceof OakModerationServiceError) {
        throw new AilaModerationError(
          `Oak Moderation Service failed (${error.statusCode}): ${error.message}`,
        );
      }

      throw new AilaModerationError(
        `Oak Moderation Service failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
