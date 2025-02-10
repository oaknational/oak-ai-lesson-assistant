// AilaFeatureFactory.ts
import type { AnalyticsAdapter } from "../features/analytics";
import { AilaAnalytics } from "../features/analytics/AilaAnalytics";
import { SentryErrorReporter } from "../features/errorReporting/reporters/SentryErrorReporter";
import { AilaModeration } from "../features/moderation";
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
