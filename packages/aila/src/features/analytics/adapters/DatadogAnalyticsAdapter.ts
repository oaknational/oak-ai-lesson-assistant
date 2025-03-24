import { aiLogger } from "@oakai/logger";
import type { LanguageModelUsage } from "ai";
import { z } from "zod";

import { AnalyticsAdapter } from "./AnalyticsAdapter";

const log = aiLogger("aila:analytics");

const AnalyticsEventSchema = z.object({
  chatId: z.string(),
  userId: z.string(),
  model: z.string(),
  metrics: z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number(),
    queryDuration: z.number(),
  }),
});

export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;

export interface MetricsPayload {
  userId?: string;
  chatId: string;
  queryDuration: number;
  model: string;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
}

export class DatadogAnalyticsAdapter extends AnalyticsAdapter {
  private readonly _startedAt: number = Date.now();

  public initialiseAnalyticsContext() {
    // Implement any necessary initialisation logic for Datadog
  }

  public async reportUsageMetrics(
    responseBody: LanguageModelUsage,
    startedAt?: number,
  ) {
    const metrics = this.calculateMetrics(responseBody, startedAt);
    await this.reportMetrics(metrics);
  }

  public reportModerationResult() {
    // Implement Datadog-specific moderation result reporting if needed
  }

  public async shutdown() {
    // Implement any necessary shutdown logic for Datadog
  }

  private calculateMetrics(usage: LanguageModelUsage, startedAt?: number) {
    const now = Date.now();
    const queryDuration = now - (startedAt ?? this._startedAt);
    return {
      userId: this._aila.userId,
      chatId: this._aila.chatId,
      queryDuration,
      model: this._aila.options.model,
      totalTokens: usage.totalTokens,
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
    };
  }

  private async reportMetrics(payload: MetricsPayload) {
    const url = `https://api.datadoghq.com/api/v1/series?api_key=${process.env.DATADOG_API_KEY}`;

    const tags = [
      `chat_id:${payload.chatId ?? "unknown"}`,
      `user_id:${payload.userId ?? "unknown"}`,
      `model:${payload.model}`,
    ];

    const now = Math.floor(Date.now() / 1000);

    const body = {
      series: [
        this.metricPayload({
          metric: "oai.lesson_assistant.prompt_tokens",
          now,
          value: payload.promptTokens,
          tags,
        }),
        this.metricPayload({
          metric: "oai.lesson_assistant.completion_tokens",
          now,
          value: payload.completionTokens,
          tags,
        }),
        this.metricPayload({
          metric: "oai.lesson_assistant.total_tokens",
          now,
          value: payload.totalTokens,
          tags,
        }),
        this.metricPayload({
          metric: "oai.lesson_assistant.query_duration",
          now,
          value: payload.queryDuration,
          tags,
          type: "gauge",
        }),
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

      log.info("Datadog status", result.status);
    }
  }

  private metricPayload({
    metric,
    now,
    value,
    tags,
    type = "count",
  }: {
    metric: string;
    now: number;
    value: number;
    tags: string[];
    type?: string;
  }) {
    return {
      metric,
      points: [[now, value]],
      type,
      tags,
    };
  }

  handleEvent(event: unknown) {
    const validatedEvent = AnalyticsEventSchema.parse(event);

    this.recordMetric("prompt_tokens", validatedEvent.metrics.promptTokens);
    this.recordMetric(
      "completion_tokens",
      validatedEvent.metrics.completionTokens,
    );
    this.recordMetric("total_tokens", validatedEvent.metrics.totalTokens);
    this.recordMetric("query_duration", validatedEvent.metrics.queryDuration);
  }

  private recordMetric(name: string, value: number) {
    void this.reportMetrics({
      chatId: this._aila.chatId,
      userId: this._aila.userId,
      model: this._aila.options.model,
      queryDuration: 0,
      totalTokens: 0,
      promptTokens: 0,
      completionTokens: 0,
      [name]: value,
    });
  }
}
