import { type AilaAmericanismsFeature } from "../features/americanisms";
import { type AilaAnalytics } from "../features/analytics/AilaAnalytics";
import { type AilaErrorReporter } from "../features/errorReporting";
import { type AilaRagFeature } from "../features/rag";
import { type AilaSnapshotStore } from "../features/snapshotStore";
import type {
  AilaAnalyticsFeature,
  AilaModerationFeature,
  AilaPersistenceFeature,
  AilaThreatDetectionFeature,
} from "../features/types";
import { type MessagePart } from "../protocol/jsonPatchProtocol";
import type {
  AilaRagRelevantLesson,
  LooseLessonPlan,
} from "../protocol/schema";
import { type Message } from "./chat";
import { type AilaPlugin } from "./plugins";
import { type AilaOptionsWithDefaultFallbackValues } from "./types";

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
  setUpInitialLessonPlan(messages: Message[]): Promise<void>;
}

export interface AilaChatService {
  readonly userId: string | undefined;
  readonly id: string;
  readonly messages: Message[];
  get relevantLessons(): AilaRagRelevantLesson[];
  set relevantLessons(lessons: AilaRagRelevantLesson[]);
  readonly parsedMessages: MessagePart[][];
  readonly isShared: boolean | undefined;
  loadChat({ store }: { store: string }): Promise<void>;
  addMessage(message: Message): void;
  startStreaming(abortController?: AbortController): ReadableStream;
}

export interface AilaServices {
  readonly userId: string | undefined;
  readonly chatId: string;
  readonly lessonPlan: LooseLessonPlan;
  readonly messages: Message[];
  readonly options: AilaOptionsWithDefaultFallbackValues;
  readonly analytics?: AilaAnalyticsFeature;
  readonly errorReporter?: AilaErrorReporter;
  readonly threatDetection?: AilaThreatDetectionFeature;
  readonly chat: AilaChatService;
  readonly lesson: AilaLessonService;
  readonly snapshotStore: AilaSnapshotStore;
  readonly persistence?: AilaPersistenceFeature[];
  readonly moderation?: AilaModerationFeature;
  readonly plugins: AilaPlugin[];
  readonly rag: AilaRagFeature;
  readonly americanisms: AilaAmericanismsFeature;
}
