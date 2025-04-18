import type { Message } from "../core/chat";
import type { AilaDocumentContent } from "../core/document/types";
import type { AilaPluginContext } from "../core/plugins";
import type { ModerationDocument } from "../protocol/jsonPatchProtocol";
import type { AilaPersistedChat } from "../protocol/schema";
import type {
  AilaErrorBreadcrumb,
  AilaErrorSeverity,
} from "./errorReporting/types";
import type { AilaGeneration } from "./generation/AilaGeneration";
import type { AilaThreatDetector } from "./threatDetection";

export interface AilaModerationFeature {
  moderate(options: {
    messages: Message[];
    content: AilaDocumentContent;
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
  detectors: AilaThreatDetector[];
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
  categorise<T extends AilaDocumentContent>(
    messages: Message[],
    content: AilaDocumentContent,
  ): Promise<T | undefined>;
}
