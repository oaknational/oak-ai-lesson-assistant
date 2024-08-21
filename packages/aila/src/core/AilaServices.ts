import { AilaAnalytics } from "../features/analytics/AilaAnalytics";
import { AilaErrorReporter } from "../features/errorReporting";
import {
  AilaAnalyticsFeature,
  AilaModerationFeature,
  AilaPersistenceFeature,
  AilaThreatDetectionFeature,
} from "../features/types";
import { LooseLessonPlan } from "../protocol/schema";
import { Message } from "./chat";
import { AilaOptionsWithDefaultFallbackValues } from "./index";
import { LLMService } from "./llm/LLMService";
import { AilaPlugin } from "./plugins";

// This provides a set of interfaces between the Aila core and the features that use it.
// We can then mock these out in tests without needing to instantiate the entire Aila object.
export interface AilaAnalyticsService {
  readonly analytics?: AilaAnalytics;
  reportUsageMetrics(text: string): Promise<void>;
}

export interface AilaLessonService {
  readonly plan: LooseLessonPlan;
  readonly hasSetInitialState: boolean;
  applyPatches(patches: string): void;
  initialise(plan: LooseLessonPlan): void;
}

export interface AilaChatService {
  readonly userId?: string;
  readonly id?: string;
  readonly messages: Message[];
  addMessage(message: Message): void;
  startStreaming(abortController?: AbortController): ReadableStream;
}

export interface AilaServices {
  readonly userId: string | undefined;
  readonly chatId: string | undefined;
  readonly lessonPlan: LooseLessonPlan;
  readonly messages: Message[];
  readonly options: AilaOptionsWithDefaultFallbackValues;
  readonly analytics?: AilaAnalyticsFeature;
  readonly errorReporter?: AilaErrorReporter;
  readonly llmService: LLMService;
  readonly threatDetection?: AilaThreatDetectionFeature;
  readonly chat: AilaChatService;
  readonly lesson: AilaLessonService;
  readonly persistence?: AilaPersistenceFeature[];
  readonly moderation?: AilaModerationFeature;
  readonly plugins: AilaPlugin[];
}
