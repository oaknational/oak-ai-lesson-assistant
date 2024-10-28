// AilaFeatureFactory.ts
import type { AnalyticsAdapter } from "../features/analytics";
import { AilaAnalytics } from "../features/analytics/AilaAnalytics";
import { SentryErrorReporter } from "../features/errorReporting/reporters/SentryErrorReporter";
import { AilaModeration } from "../features/moderation";
import type {
  OpenAILike} from "../features/moderation/moderators/OpenAiModerator";
import {
  OpenAiModerator,
} from "../features/moderation/moderators/OpenAiModerator";
import { AilaPrismaPersistence } from "../features/persistence/adaptors/prisma";
import { AilaSnapshotStore } from "../features/snapshotStore";
import { AilaThreatDetection } from "../features/threatDetection";
import type {
  AilaAnalyticsFeature,
  AilaErrorReportingFeature,
  AilaModerationFeature,
  AilaPersistenceFeature,
  AilaThreatDetectionFeature,
} from "../features/types";
import { type AilaServices } from "./AilaServices";
import type { AilaOptions } from "./types";

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
      const moderator = new OpenAiModerator({
        userId: aila.userId,
        chatId: aila.chatId,
        openAiClient,
      });
      return new AilaModeration({ aila, moderator });
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
