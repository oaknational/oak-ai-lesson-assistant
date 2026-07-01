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
      const shadowEnabled = process.env.MODERATION_SHADOW_ENABLED === "true";
      const shadowBaseUrl = process.env.MODERATION_SHADOW_API_URL;

      const createOakModerator = ({
        baseUrl,
        missingBaseUrlMessage,
        protectionBypassSecret,
      }: {
        baseUrl: string | undefined;
        missingBaseUrlMessage: string;
        protectionBypassSecret?: string;
      }) => {
        if (fixtureOakModerator) {
          return fixtureOakModerator;
        }

        invariant(baseUrl, missingBaseUrlMessage);
        return new OakModerationServiceModerator({
          baseUrl,
          chatId: aila.chatId,
          userId: aila.userId,
          protectionBypassSecret,
        });
      };

      const createOpenAiModerator = () =>
        new OpenAiModerator({
          userId: aila.userId,
          chatId: aila.chatId,
          openAiClient,
        });

      const createShadowModerator = () => {
        if (!shadowEnabled) {
          return undefined;
        }

        if (!shadowBaseUrl) {
          log.warn(
            "MODERATION_SHADOW_ENABLED is true but MODERATION_SHADOW_API_URL is not set; shadow moderation disabled",
          );
          return undefined;
        }

        log.info("Shadow moderation enabled (Oak Moderation Service)", {
          baseUrl: shadowBaseUrl,
        });
        return createOakModerator({
          baseUrl: shadowBaseUrl,
          missingBaseUrlMessage:
            "MODERATION_SHADOW_API_URL is required when shadow moderation is enabled",
          protectionBypassSecret:
            process.env.MODERATION_SHADOW_API_BYPASS_SECRET ?? undefined,
        });
      };

      if (oakServicePrimary) {
        log.info("Oak Moderation Service is primary moderator");
        return new AilaModeration({
          aila,
          prisma: aila.prisma,
          moderator: createOakModerator({
            baseUrl,
            missingBaseUrlMessage:
              "MODERATION_API_URL is required when the Oak Moderation Service is primary",
            protectionBypassSecret:
              process.env.MODERATION_API_BYPASS_SECRET ?? undefined,
          }),
          shadowModerator: createShadowModerator(),
        });
      }

      log.info("OpenAI moderator is primary moderator");
      return new AilaModeration({
        aila,
        prisma: aila.prisma,
        moderator: createOpenAiModerator(),
        shadowModerator: createShadowModerator(),
      });
    }
    return undefined;
  }

  static createSnapshotStore(aila: AilaServices) {
    return new AilaSnapshotStore({ aila, prisma: aila.prisma });
  }

  static createPersistence(
    aila: AilaServices,
    options: AilaOptions,
  ): AilaPersistenceFeature[] {
    if (options.usePersistence) {
      return [
        new AilaPrismaPersistence({
          chat: aila.chat,
          aila,
          prisma: aila.prisma,
        }),
      ];
    }
    return [];
  }

  static createThreatDetection(
    _aila: AilaServices,
    options: AilaOptions,
    detectors?: AilaThreatDetector[],
  ): AilaThreatDetectionFeature | undefined {
    if (options.useThreatDetection && detectors) {
      return { detectors };
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
