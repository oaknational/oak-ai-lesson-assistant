import type { AilaAmericanismsFeature } from "../features/americanisms";
import type { AilaAnalytics } from "../features/analytics/AilaAnalytics";
import type { AilaErrorReporter } from "../features/errorReporting";
import type { AilaSnapshotStore } from "../features/snapshotStore";
import type {
  AilaAnalyticsFeature,
  AilaModerationFeature,
  AilaPersistenceFeature,
  AilaThreatDetectionFeature,
} from "../features/types";
import type {
  MessagePart,
  ValidPatchDocument,
} from "../protocol/jsonPatchProtocol";
import type {
  AilaPersistedChat,
  AilaRagRelevantLesson,
} from "../protocol/schema";
import type { Message } from "./chat";
import type { AilaDocumentContent } from "./document/types";
import type { AilaPlugin } from "./plugins";
import type { FullQuizService } from "./quiz/interfaces";
import type { AilaOptionsWithDefaultFallbackValues } from "./types";

// This provides a set of interfaces between the Aila core and the features that use it.
// We can then mock these out in tests without needing to instantiate the entire Aila object.
export interface AilaAnalyticsService {
  readonly analytics?: AilaAnalytics;
  reportUsageMetrics(text: string): Promise<void>;
}

export interface AilaDocumentService {
  content: AilaDocumentContent;
  readonly hasInitialisedContentFromMessages: boolean;
  extractAndApplyLlmPatches(patches: string): void;
  applyValidPatches(validPatches: ValidPatchDocument[]): void;
  initialise(content: AilaDocumentContent): void;
  initialiseContentFromMessages(messages: Message[]): Promise<void>;
}

export interface AilaChatService {
  readonly userId: string | undefined;
  readonly id: string;
  readonly messages: Message[];
  readonly iteration: number | undefined;
  readonly createdAt: Date | undefined;
  readonly persistedChat: AilaPersistedChat | undefined;
  get relevantLessons(): AilaRagRelevantLesson[];
  set relevantLessons(lessons: AilaRagRelevantLesson[]);
  readonly parsedMessages: MessagePart[][];
  readonly isShared: boolean | undefined;
  readonly fullQuizService: FullQuizService;
  loadChat({ store }: { store: string }): Promise<void>;
  addMessage(message: Message): void;
  startStreaming(abortController?: AbortController): ReadableStream;
}

export interface AilaServices {
  readonly userId: string | undefined;
  readonly chatId: string;
  readonly messages: Message[];
  readonly options: AilaOptionsWithDefaultFallbackValues;
  readonly analytics?: AilaAnalyticsFeature;
  readonly errorReporter?: AilaErrorReporter;
  readonly threatDetection?: AilaThreatDetectionFeature;
  readonly chat: AilaChatService;
  readonly document: AilaDocumentService;
  readonly snapshotStore: AilaSnapshotStore;
  readonly persistence?: AilaPersistenceFeature[];
  readonly moderation?: AilaModerationFeature;
  readonly plugins: AilaPlugin[];
  readonly americanisms: AilaAmericanismsFeature;
}
