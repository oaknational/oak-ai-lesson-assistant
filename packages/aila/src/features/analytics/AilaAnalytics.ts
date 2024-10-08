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
    const promise = Promise.all(
      this._adapters.map((adapter) =>
        adapter.reportUsageMetrics(responseBody, startedAt),
      ),
    );
    this._aila.plugins.forEach((plugin) => plugin.onBackgroundWork(promise));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public reportModerationResult(moderationResultEvent: any) {
    this._adapters.forEach((adapter) =>
      adapter.reportModerationResult(moderationResultEvent),
    );
  }

  public async shutdown() {
    if (!this._isShutdown) {
      const promise = Promise.all(
        this._adapters.map((adapter) => adapter.shutdown()),
      );
      this._aila.plugins.forEach((plugin) => plugin.onBackgroundWork(promise));
      this._isShutdown = true;
    }
  }
}
