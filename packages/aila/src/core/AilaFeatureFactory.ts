// AilaFeatureFactory.ts
import {
  DatadogAnalyticsAdapter,
  PosthogAnalyticsAdapter,
} from "../features/analytics";
import { AilaAnalytics } from "../features/analytics/AilaAnalytics";
import { SentryErrorReporter } from "../features/errorReporting/reporters/SentryErrorReporter";
import { AilaModeration } from "../features/moderation";
import { OpenAiModerator } from "../features/moderation/moderators/OpenAiModerator";
import { AilaKVPersistence } from "../features/persistence/adaptors/kv";
import { AilaPrismaPersistence } from "../features/persistence/adaptors/prisma";
import { AilaThreatDetection } from "../features/threatDetection";
import {
  AilaAnalyticsFeature,
  AilaErrorReportingFeature,
  AilaModerationFeature,
  AilaPersistenceFeature,
  AilaThreatDetectionFeature,
} from "../features/types";
import { AilaServices } from "./AilaServices";
import { AilaOptions } from "./types";

export class AilaFeatureFactory {
  static createAnalytics(
    aila: AilaServices,
    options: AilaOptions,
  ): AilaAnalyticsFeature | undefined {
    if (options.useAnalytics) {
      return new AilaAnalytics({
        aila,
        adapters: [
          new PosthogAnalyticsAdapter(aila),
          new DatadogAnalyticsAdapter(aila),
        ],
      });
    }
    return undefined;
  }

  static createModeration(
    aila: AilaServices,
    options: AilaOptions,
  ): AilaModerationFeature | undefined {
    if (options.useModeration) {
      const moderator = new OpenAiModerator({
        userId: aila.userId,
        chatId: aila.chatId,
      });
      return new AilaModeration({ aila, moderator });
    }
    return undefined;
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
    aila: AilaServices,
    options: AilaOptions,
  ): AilaThreatDetectionFeature | undefined {
    if (options.useThreatDetection) {
      return new AilaThreatDetection({ detector: undefined });
    }
    return undefined;
  }

  static createErrorReporter(
    aila: AilaServices,
    options: AilaOptions,
  ): AilaErrorReportingFeature | undefined {
    if (options.useErrorReporting) {
      return new SentryErrorReporter();
    }
    return undefined;
  }
}
