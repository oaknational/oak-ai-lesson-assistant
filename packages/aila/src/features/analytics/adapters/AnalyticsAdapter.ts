import type { LanguageModelUsage } from "ai";

import type { AilaServices } from "../../../core/AilaServices";

export abstract class AnalyticsAdapter {
  protected _aila: AilaServices;

  constructor(aila: AilaServices) {
    this._aila = aila;
  }

  abstract initialiseAnalyticsContext(): void;
  abstract reportUsageMetrics(
    usage: LanguageModelUsage,
    startedAt?: number,
  ): Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract reportModerationResult(moderationResultEvent: any): void;
  abstract shutdown(): Promise<void>;
}
