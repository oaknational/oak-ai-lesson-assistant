import { getEncoding } from "js-tiktoken";
import { PostHog } from "posthog-node";
import invariant from "tiny-invariant";

import { AilaServices } from "../../../core";
import { reportCompletionAnalyticsEvent } from "../../../lib/openai/OpenAICompletionWithLogging";
import { AnalyticsAdapter } from "./AnalyticsAdapter";

export class PosthogAnalyticsAdapter extends AnalyticsAdapter {
  private _posthogClient: PostHog;
  private _startedAt: number = Date.now();
  private _isShutdown: boolean = false;

  constructor(aila: AilaServices) {
    super(aila);
    invariant(
      process.env.NEXT_PUBLIC_POSTHOG_API_KEY,
      "NEXT_PUBLIC_POSTHOG_API_KEY is required",
    );
    this._posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_API_KEY, {
      host: process.env.POSTHOG_HOST,
    });
  }

  public initialiseAnalyticsContext() {
    // Implement any necessary initialisation logic for Posthog
  }

  public async reportUsageMetrics(responseBody: string, startedAt?: number) {
    const metricsPayload = this.calculateMetrics(responseBody, startedAt);
    // #TODO This is calling outside of the package and it should probably
    // be moved into the Aila package
    await reportCompletionAnalyticsEvent(metricsPayload, this._posthogClient);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public reportModerationResult(moderationResultEvent: any) {
    this._posthogClient.capture(moderationResultEvent);
  }

  public async shutdown() {
    if (!this._isShutdown) {
      await this._posthogClient.shutdown();
      this._isShutdown = true;
    }
  }

  private calculateMetrics(responseBody: string, startedAt?: number) {
    const now = Date.now();
    const queryDuration = now - (startedAt ?? this._startedAt);
    const modelEncoding = getEncoding("cl100k_base");
    const promptTokens = this._aila.messages.reduce((acc, message) => {
      return acc + modelEncoding.encode(message.content).length;
    }, 0);
    const completionTokens = modelEncoding.encode(responseBody).length;
    const totalTokens = promptTokens + completionTokens;
    return {
      userId: this._aila.userId,
      chatId: this._aila.chatId,
      queryDuration,
      model: this._aila.options.model,
      totalTokens,
      promptTokens,
      completionTokens,
    };
  }
}
