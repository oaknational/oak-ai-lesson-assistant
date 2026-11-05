import type { OakPrismaClient } from "@oakai/db/client";

import type { AilaAmericanismsFeature } from "../features/americanisms";
import type { AnalyticsAdapter } from "../features/analytics";
import type { AilaModerator } from "../features/moderation/moderators";
import type { OpenAILike } from "../features/moderation/moderators/OpenAiModerator";
import type { AilaPersistence } from "../features/persistence";
import type { AilaThreatDetector } from "../features/threatDetection";
import type { AilaTracingService } from "../features/tracing";
import type {
  AilaAnalyticsFeature,
  AilaErrorReportingFeature,
  AilaModerationFeature,
  AilaThreatDetectionFeature,
} from "../features/types";
import type { AilaServices } from "./AilaServices";
import type { Message } from "./chat";
import type { AilaDocumentContent } from "./document/types";
import type { AilaPlugin } from "./plugins/types";
import type { QuestionSourceType } from "./quiz/schema";

export type AilaGenerateDocumentMode = "interactive" | "generate";

export type AilaGenerateDocumentOptions = {
  mode?: AilaGenerateDocumentMode;
  input?: string;
  title?: string;
  topic?: string;
  keyStage?: string;
  subject?: string;
};

export type AilaPublicChatOptions = {
  quizSources?: QuestionSourceType[];
};

export type AgenticFixtureConfig = {
  mode: "record" | "replay";
  fixtureName: string;
};

export type AilaOptions = AilaPublicChatOptions & {
  useErrorReporting?: boolean;
  usePersistence?: boolean;
  useModeration?: boolean;
  useAnalytics?: boolean;
  useThreatDetection?: boolean;
  useMathsQuizRag?: boolean;
  mode?: AilaGenerateDocumentMode;
  agenticFixture?: AgenticFixtureConfig;
};

export type AilaOptionsWithDefaultFallbackValues = Required<
  Omit<AilaOptions, "agenticFixture">
> &
  Pick<AilaOptions, "agenticFixture">;

export type AilaChatInitializationOptions = {
  id: string;
  userId: string | undefined;
  messages?: Message[];
  onStreamError?: (error: unknown) => void;
};

export type AilaInitializationOptions = {
  document?: {
    content: AilaDocumentContent;
  };
  chat: AilaChatInitializationOptions;
  options?: AilaOptions;
  prisma: OakPrismaClient;
  moderator?: AilaModerator;
  moderation?: AilaModerationFeature;
  persistence?: AilaPersistence[];
  analytics?: AilaAnalyticsFeature;
  threatDetection?: AilaThreatDetectionFeature;
  errorReporter?: AilaErrorReportingFeature;
  plugins: AilaPlugin[];
  services?: {
    moderationAiClient?: OpenAILike;
    oakModerator?: AilaModerator;
    americanismsService?: (aila: AilaServices) => AilaAmericanismsFeature;
    analyticsAdapters?: (aila: AilaServices) => AnalyticsAdapter[];
    threatDetectors?: (aila: AilaServices) => AilaThreatDetector[];
    tracingService?: AilaTracingService;
  };
};
