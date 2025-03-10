import type { AilaServices } from "../../core/AilaServices";
import type { AnalyticsAdapter } from "./adapters/AnalyticsAdapter";

export class AilaAnalytics {
  private readonly _aila: AilaServices;
  private readonly _adapters: AnalyticsAdapter[];
  private readonly _operations: Promise<unknown>[] = [];
  private _isShutdown: boolean = false;

  constructor({
    aila,
    adapters,
  }: {
    aila: AilaServices;
    adapters?: AnalyticsAdapter[];
  }) {
    this._adapters = adapters ?? [];
    this._aila = aila;
  }

  public initialiseAnalyticsContext() {
    this._adapters.forEach((adapter) => adapter.initialiseAnalyticsContext());
  }

  public async reportUsageMetrics(
    responseBody: string,
    startedAt?: number,
  ): Promise<void> {
    const promise = Promise.all(
      this._adapters.map((adapter) =>
        adapter.reportUsageMetrics(responseBody, startedAt),
      ),
    );
    this._operations.push(promise);
    this._aila.plugins.forEach((plugin) => plugin.onBackgroundWork(promise));
    return Promise.resolve();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public reportModerationResult(moderationResultEvent: any) {
    this._adapters.forEach((adapter) =>
      adapter.reportModerationResult(moderationResultEvent),
    );
  }

  public async shutdown() {
    if (!this._isShutdown) {
      const promise = (async () => {
        await Promise.all(this._operations);
        await Promise.all(this._adapters.map((adapter) => adapter.shutdown()));
      })();

      this._aila.plugins.forEach((plugin) => plugin.onBackgroundWork(promise));
      this._isShutdown = true;
    }
    return Promise.resolve();
  }
}
