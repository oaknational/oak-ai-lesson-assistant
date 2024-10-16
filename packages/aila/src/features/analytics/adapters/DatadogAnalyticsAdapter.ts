import { aiLogger } from "@oakai/logger";
import { getEncoding } from "js-tiktoken";

import { AnalyticsAdapter } from "./AnalyticsAdapter";

const log = aiLogger("aila:analytics");

export class DatadogAnalyticsAdapter extends AnalyticsAdapter {
  private _startedAt: number = Date.now();

  public initialiseAnalyticsContext() {
    // Implement any necessary initialisation logic for Datadog
  }

  public async reportUsageMetrics(responseBody: string, startedAt?: number) {
    const metrics = this.calculateMetrics(responseBody, startedAt);
    await this.reportMetrics(metrics);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  public reportModerationResult(moderationResultEvent: any) {
    // Implement Datadog-specific moderation result reporting if needed
  }

  public async shutdown() {
    // Implement any necessary shutdown logic for Datadog
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

  // #TODO define a payload type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async reportMetrics(payload: any) {
    const url = `https://api.datadoghq.com/api/v1/series?api_key=${process.env.DATADOG_API_KEY}`;

    const tags = [
      `chat_id:${payload.chatId ?? "unknown"}`,
      `user_id:${payload.userId ?? "unknown"}`,
      `model:${payload.model}`,
    ];

    const now = Math.floor(Date.now() / 1000);

    const body = {
      series: [
        this.metricPayload(
          "oai.lesson_assistant.prompt_tokens",
          now,
          payload.promptTokens,
          tags,
        ),
        this.metricPayload(
          "oai.lesson_assistant.completion_tokens",
          now,
          payload.completionTokens,
          tags,
        ),
        this.metricPayload(
          "oai.lesson_assistant.total_tokens",
          now,
          payload.totalTokens,
          tags,
        ),
        this.metricPayload(
          "oai.lesson_assistant.query_duration",
          now,
          payload.queryDuration,
          tags,
          "gauge",
        ),
      ],
    };

    if (process.env.DATADOG_ENABLED === "true") {
      const result = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      log("Datadog status", result.status);
    }
  }

  private metricPayload(
    metric: string,
    now: number,
    value: number,
    tags: string[],
    type = "count",
  ) {
    return {
      metric,
      points: [[now, value]],
      type,
      tags,
    };
  }
}
