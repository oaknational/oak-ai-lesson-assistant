import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import {
  OakModerationServiceError,
  moderateWithOakService,
} from "@oakai/core/src/utils/ailaModeration/oakModerationService";
import { aiLogger } from "@oakai/logger";

import {
  AilaModerationError,
  AilaModerator,
  type AilaModeratorContext,
} from "./AilaModerator";

const log = aiLogger("aila:moderation");

export interface OakModerationServiceModeratorConfig {
  baseUrl: string;
  chatId: string;
  userId?: string;
  timeoutMs?: number;
  protectionBypassSecret?: string;
}

/**
 * Moderator implementation that calls the Oak AI Moderation Service.
 * Delegates to the shared moderateWithOakService() client in packages/core.
 */
export class OakModerationServiceModerator extends AilaModerator {
  private readonly config: OakModerationServiceModeratorConfig;

  constructor(config: OakModerationServiceModeratorConfig) {
    super({ userId: config.userId, chatId: config.chatId });
    this.config = config;
  }

  async moderate(
    input: string,
    context?: AilaModeratorContext,
  ): Promise<ModerationResult> {
    log.info("Calling Oak Moderation Service", {
      contentLength: input.length,
    });

    try {
      return await moderateWithOakService(input, {
        baseUrl: this.config.baseUrl,
        timeoutMs: this.config.timeoutMs,
        protectionBypassSecret: this.config.protectionBypassSecret,
        context,
      });
    } catch (err) {
      if (err instanceof OakModerationServiceError) {
        throw new AilaModerationError(err.message, { cause: err });
      }
      throw new AilaModerationError("Oak Moderation Service failed", {
        cause: err,
      });
    }
  }
}
