import { PrismaClientWithAccelerate } from "@oakai/db";

import { AilaModerator } from "../features/moderation/moderators";
import { AilaPersistence } from "../features/persistence";
import { AilaThreatDetector } from "../features/threatDetection";
import {
  AilaAnalyticsFeature,
  AilaErrorReportingFeature,
  AilaModerationFeature,
  AilaThreatDetectionFeature,
} from "../features/types";
import { LooseLessonPlan } from "../protocol/schema";
import { Message } from "./chat";
import { LLMService } from "./llm/LLMService";
import { AilaPlugin } from "./plugins/types";
import { AilaPromptBuilder } from "./prompt/AilaPromptBuilder";

export type AilaGenerateLessonPlanMode = "full" | "repeat" | "single";

export type AilaGenerateLessonPlanOptions = {
  mode?: AilaGenerateLessonPlanMode;
  input?: string;
  title?: string;
  topic?: string;
  keyStage?: string;
  subject?: string;
  abortController?: AbortController;
};

export interface AilaPublicChatOptions {
  useRag?: boolean;
  temperature?: number;
  numberOfLessonPlansInRag?: number;
}

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
  id?: string;
  userId?: string;
  messages?: Message[];
  llmService?: LLMService;
  onStreamError?: (error: unknown) => void;
};

export type AilaInitializationOptions = {
  lessonPlan?: LooseLessonPlan;
  chat?: AilaChatInitializationOptions;
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
};
