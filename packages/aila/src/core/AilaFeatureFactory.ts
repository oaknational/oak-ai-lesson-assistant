// AilaFeatureFactory.ts
import { aiLogger } from "@oakai/logger";

import type { AnalyticsAdapter } from "../features/analytics";
import { AilaAnalytics } from "../features/analytics/AilaAnalytics";
import { SentryErrorReporter } from "../features/errorReporting/reporters/SentryErrorReporter";
import { AilaModeration } from "../features/moderation";
import { OakModerationServiceModerator } from "../features/moderation/moderators/OakModerationServiceModerator";
import type { OpenAILike } from "../features/moderation/moderators/OpenAiModerator";
import { OpenAiModerator } from "../features/moderation/moderators/OpenAiModerator";
import { AilaPrismaPersistence } from "../features/persistence/adaptors/prisma";
import { AilaSnapshotStore } from "../features/snapshotStore";
import { AilaThreatDetection } from "../features/threatDetection";
import type { AilaThreatDetector } from "../features/threatDetection/detectors/AilaThreatDetector";
import type {
  AilaAnalyticsFeature,
  AilaErrorReportingFeature,
  AilaModerationFeature,
  AilaPersistenceFeature,
  AilaThreatDetectionFeature,
} from "../features/types";
import type { AilaServices } from "./AilaServices";
import type { AilaOptions } from "./types";

const log = aiLogger("aila");

export class AilaFeatureFactory {
  static createAnalytics(
    aila: AilaServices,
    options: AilaOptions,
    adapters: AnalyticsAdapter[] = [],
  ): AilaAnalyticsFeature | undefined {
    if (options.useAnalytics) {
      return new AilaAnalytics({
        aila,
        adapters,
      });
    }
    return undefined;
  }

  static createModeration(
    aila: AilaServices,
    options: AilaOptions,
    openAiClient?: OpenAILike,
  ): AilaModerationFeature | undefined {
    if (options.useModeration) {
      // Production moderator (always created)
      const moderator = new OpenAiModerator({
        userId: aila.userId,
        chatId: aila.chatId,
        openAiClient,
      });

      // Shadow moderator (optional, based on env vars)
      const shadowEnabled =
        process.env.OAK_MODERATION_SHADOW_ENABLED === "true";
      const shadowBaseUrl = process.env.MODERATION_API_URL;

      let shadowModerator: OakModerationServiceModerator | undefined;

      if (shadowEnabled && shadowBaseUrl) {
        log.info("Shadow moderation enabled");
        shadowModerator = new OakModerationServiceModerator({
          baseUrl: shadowBaseUrl,
          chatId: aila.chatId,
          userId: aila.userId,
        });
      } else if (shadowEnabled && !shadowBaseUrl) {
        log.warn(
          "OAK_MODERATION_SHADOW_ENABLED is true but MODERATION_API_URL is not set. Shadow moderation disabled.",
        );
      }

      return new AilaModeration({
        aila,
        moderator,
        shadowModerator,
        waitUntil: options.waitUntil,
      });
    }
    return undefined;
  }

  static createSnapshotStore(aila: AilaServices) {
    return new AilaSnapshotStore({ aila });
  }

  static createPersistence(
    aila: AilaServices,
    options: AilaOptions,
  ): AilaPersistenceFeature[] {
    if (options.usePersistence) {
      return [new AilaPrismaPersistence({ chat: aila.chat, aila })];
    }
    return [];
  }

  static createThreatDetection(
    _aila: AilaServices,
    options: AilaOptions,
    detectors?: AilaThreatDetector[],
  ): AilaThreatDetectionFeature | undefined {
    if (options.useThreatDetection && detectors) {
      return new AilaThreatDetection(detectors);
    }
    return undefined;
  }

  static createErrorReporter(
    _aila: AilaServices,
    options: AilaOptions,
  ): AilaErrorReportingFeature | undefined {
    if (options.useErrorReporting) {
      return new SentryErrorReporter();
    }
    return undefined;
  }
}
