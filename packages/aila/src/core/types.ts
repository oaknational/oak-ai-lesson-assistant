import { type PrismaClientWithAccelerate } from "@oakai/db";

import { AilaModerator } from "../features/moderation/moderators";
import { OpenAILike } from "../features/moderation/moderators/OpenAiModerator";
import { AilaPersistence } from "../features/persistence";
import { AilaThreatDetector } from "../features/threatDetection";
import {
  AilaAnalyticsFeature,
  AilaCategorisationFeature,
  AilaErrorReportingFeature,
  AilaModerationFeature,
  AilaThreatDetectionFeature,
} from "../features/types";
import { LooseLessonPlan } from "../protocol/schema";
import { Message } from "./chat";
import { LLMService } from "./llm/LLMService";
import { AilaPlugin } from "./plugins/types";
import { AilaPromptBuilder } from "./prompt/AilaPromptBuilder";

export type AilaGenerateLessonPlanMode = "interactive" | "generate";

export type AilaGenerateLessonPlanOptions = {
  mode?: AilaGenerateLessonPlanMode;
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
  numberOfLessonPlansInRag?: number;
};

export type AilaOptions = AilaPublicChatOptions & {
  useErrorReporting?: boolean;
  usePersistence?: boolean;
  useModeration?: boolean;
  useAnalytics?: boolean;
  useThreatDetection?: boolean;
  model?: string;
  mode?: AilaGenerateLessonPlanMode;
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
  lessonPlan?: LooseLessonPlan;
  chat: Omit<AilaChatInitializationOptions, "llmService">;
  options?: AilaOptions;
  prisma?: PrismaClientWithAccelerate;
  moderator?: AilaModerator;
  moderation?: AilaModerationFeature;
  persistence?: AilaPersistence[];
  analytics?: AilaAnalyticsFeature;
  threatDetection?: AilaThreatDetectionFeature;
  threatDetector?: AilaThreatDetector;
  errorReporter?: AilaErrorReportingFeature;
  promptBuilder?: AilaPromptBuilder;
  plugins: AilaPlugin[];
  services?: {
    chatCategoriser?: AilaCategorisationFeature;
    chatLlmService?: LLMService;
    moderationAiClient?: OpenAILike;
  };
};
