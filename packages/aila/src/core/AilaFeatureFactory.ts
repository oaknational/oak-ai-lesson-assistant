// AilaFeatureFactory.ts
import { aiLogger } from "@oakai/logger";

import invariant from "tiny-invariant";

import type { AnalyticsAdapter } from "../features/analytics";
import { AilaAnalytics } from "../features/analytics/AilaAnalytics";
import { SentryErrorReporter } from "../features/errorReporting/reporters/SentryErrorReporter";
import { AilaModeration } from "../features/moderation";
import type { AilaModerator } from "../features/moderation/moderators";
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
    fixtureOakModerator?: AilaModerator,
  ): AilaModerationFeature | undefined {
    if (options.useModeration) {
      const oakServicePrimary =
        process.env.OAK_MODERATION_V1_PRIMARY === "true";
      const baseUrl = process.env.MODERATION_API_URL;

      const oakModerator =
        fixtureOakModerator ??
        (() => {
          invariant(
            baseUrl,
            "MODERATION_API_URL is required when moderation is enabled",
          );
          return new OakModerationServiceModerator({
            baseUrl,
            chatId: aila.chatId,
            userId: aila.userId,
            protectionBypassSecret:
              process.env.MODERATION_API_BYPASS_SECRET || undefined,
          });
        })();

      if (oakServicePrimary) {
        log.info("Oak Moderation Service is primary moderator");
        return new AilaModeration({
          aila,
          moderator: oakModerator,
          shadowModerator: new OpenAiModerator({
            userId: aila.userId,
            chatId: aila.chatId,
            openAiClient,
          }),
        });
      }

      log.info("Shadow moderation enabled (Oak Moderation Service)");
      return new AilaModeration({
        aila,
        moderator: new OpenAiModerator({
          userId: aila.userId,
          chatId: aila.chatId,
          openAiClient,
        }),
        shadowModerator: oakModerator,
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
