import type { PrismaClientWithAccelerate } from "@oakai/db/client";

import type { AilaAmericanismsFeature } from "../features/americanisms";
import type { AnalyticsAdapter } from "../features/analytics";
import type { AilaModerator } from "../features/moderation/moderators";
import type { OpenAILike } from "../features/moderation/moderators/OpenAiModerator";
import type { AilaPersistence } from "../features/persistence";
import type { AilaRagFeature } from "../features/rag";
import type { AilaThreatDetector } from "../features/threatDetection";
import type {
  AilaAnalyticsFeature,
  AilaCategorisationFeature,
  AilaErrorReportingFeature,
  AilaModerationFeature,
  AilaThreatDetectionFeature,
} from "../features/types";
import type { AilaServices } from "./AilaServices";
import type { Message } from "./chat";
import type { AilaDocumentContent } from "./document/types";
import type { LLMService } from "./llm/LLMService";
import type { AilaPlugin } from "./plugins/types";
import type { AilaPromptBuilder } from "./prompt/AilaPromptBuilder";

export type AilaGenerateDocumentMode = "interactive" | "generate";

export type AilaGenerateDocumentOptions = {
  mode?: AilaGenerateDocumentMode;
  input?: string;
  title?: string;
  topic?: string;
  keyStage?: string;
  subject?: string;
  abortController?: AbortController;
};

export type AilaPublicChatOptions = {
  useRag?: boolean;
  temperature?: number;
  numberOfRecordsInRag?: number;
};

export type AilaOptions = AilaPublicChatOptions & {
  useErrorReporting?: boolean;
  usePersistence?: boolean;
  useModeration?: boolean;
  useAnalytics?: boolean;
  useThreatDetection?: boolean;
  useAgenticAila?: boolean;
  model?: string;
  mode?: AilaGenerateDocumentMode;
};

export type AilaOptionsWithDefaultFallbackValues = Required<AilaOptions>;

export type AilaChatInitializationOptions = {
  id: string;
  userId: string | undefined;
  messages?: Message[];
  llmService?: LLMService;
  onStreamError?: (error: unknown) => void;
};

export type AilaInitializationOptions = {
  document?: {
    content: AilaDocumentContent;
  };
  chat: Omit<AilaChatInitializationOptions, "llmService">;
  options?: AilaOptions;
  prisma?: PrismaClientWithAccelerate;
  moderator?: AilaModerator;
  moderation?: AilaModerationFeature;
  persistence?: AilaPersistence[];
  analytics?: AilaAnalyticsFeature;
  threatDetection?: AilaThreatDetectionFeature;
  errorReporter?: AilaErrorReportingFeature;
  promptBuilder?: AilaPromptBuilder;
  plugins: AilaPlugin[];
  services?: {
    chatCategoriser?: AilaCategorisationFeature;
    chatLlmService?: LLMService;
    moderationAiClient?: OpenAILike;
    ragService?: (aila: AilaServices) => AilaRagFeature;
    americanismsService?: (aila: AilaServices) => AilaAmericanismsFeature;
    analyticsAdapters?: (aila: AilaServices) => AnalyticsAdapter[];
    threatDetectors?: (aila: AilaServices) => AilaThreatDetector[];
  };
};
