import { Message } from "../core/chat";
import { AilaPluginContext } from "../core/plugins";
import { ModerationDocument } from "../protocol/jsonPatchProtocol";
import { AilaPersistedChat, LooseLessonPlan } from "../protocol/schema";
import { AilaErrorBreadcrumb, AilaErrorSeverity } from "./errorReporting/types";
import { AilaGeneration } from "./generation";
import { AilaThreatDetector } from "./threatDetection";

export interface AilaModerationFeature {
  moderate(options: {
    messages: Message[];
    lessonPlan: LooseLessonPlan;
    pluginContext: AilaPluginContext;
  }): Promise<ModerationDocument>;
}

export interface AilaAnalyticsFeature {
  initialiseAnalyticsContext(): void;
  reportUsageMetrics(responseBody: string, startedAt?: number): Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reportModerationResult(moderationResultEvent: any): void;
  shutdown(): Promise<void>;
}

export interface AilaPersistenceFeature {
  name: string;
  loadChat(): Promise<AilaPersistedChat | null>;
  upsertChat(): Promise<void>;
  upsertGeneration(generation?: AilaGeneration): Promise<void>;
}

export interface AilaThreatDetectionFeature {
  detector: AilaThreatDetector;
}

export interface AilaErrorReportingFeature {
  captureException(
    error: Error,
    level?: AilaErrorSeverity,
    context?: Record<string, unknown>,
  ): void;
  captureMessage(message: string, level: AilaErrorSeverity): void;
  addBreadcrumb(breadcrumb: AilaErrorBreadcrumb): void;
  setContext(name: string, context: Record<string, unknown>): void;
  setUser(id: string): void;
  reportError(
    error: unknown,
    message?: string,
    level?: AilaErrorSeverity,
  ): void;
  tryWithErrorReporting<T>(
    fn: () => T,
    level?: AilaErrorSeverity,
    message?: string,
    breadcrumbs?: { category: string; message: string },
  ): T | null;
}

export interface AilaCategorisationFeature {
  categorise(
    messages: Message[],
    lessonPlan: LooseLessonPlan,
  ): Promise<LooseLessonPlan | undefined>;
}
