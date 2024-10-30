import type { PrismaClientWithAccelerate } from "@oakai/db/client";
import { z } from "zod";

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
import type { LooseLessonPlan } from "../protocol/schema";
import type { AilaServices } from "./AilaServices";
import type { Message } from "./chat";
import type { LLMService } from "./llm/LLMService";
import type { AilaPlugin } from "./plugins/types";
import type { AilaPromptBuilder } from "./prompt/AilaPromptBuilder";

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

export const AilaOptionsSchema = z.object({
  useRag: z.boolean().optional(),
  temperature: z.number().optional(),
  numberOfLessonPlansInRag: z.number().optional(),
  useErrorReporting: z.boolean().optional(),
  usePersistence: z.boolean().optional(),
  useModeration: z.boolean().optional(),
  useAnalytics: z.boolean().optional(),
  useThreatDetection: z.boolean().optional(),
  model: z.string().optional(),
  mode: z.enum(["interactive", "generate"]).optional(),
});

export type AilaOptions = z.infer<typeof AilaOptionsSchema>;

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
    chatCategoriser?: (aila: AilaServices) => AilaCategorisationFeature;
    chatLlmService?: (aila: AilaServices) => LLMService;
    moderationAiClient?: OpenAILike;
    ragService?: (aila: AilaServices) => AilaRagFeature;
    americanismsService?: (aila: AilaServices) => AilaAmericanismsFeature;
    analyticsAdapters?: (aila: AilaServices) => AnalyticsAdapter[];
  };
};
