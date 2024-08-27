import { AilaServices } from "../../core";
import { AnalyticsAdapter } from "./adapters/AnalyticsAdapter";

export class AilaAnalytics {
  private _aila: AilaServices;
  private _adapters: AnalyticsAdapter[];
  private _isShutdown: boolean = false;

  constructor({
    aila,
    adapters,
  }: {
    aila: AilaServices;
    adapters?: AnalyticsAdapter[];
  }) {
    this._adapters = adapters || [];
    this._aila = aila;
  }

  public initialiseAnalyticsContext() {
    this._adapters.forEach((adapter) => adapter.initialiseAnalyticsContext());
  }

  public async reportUsageMetrics(responseBody: string, startedAt?: number) {
    await Promise.all(
      this._adapters.map((adapter) =>
        adapter.reportUsageMetrics(responseBody, startedAt),
      ),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public reportModerationResult(moderationResultEvent: any) {
    this._adapters.forEach((adapter) =>
      adapter.reportModerationResult(moderationResultEvent),
    );
  }

  public async shutdown() {
    if (!this._isShutdown) {
      await Promise.all(this._adapters.map((adapter) => adapter.shutdown()));
      this._isShutdown = true;
    }
  }
}
