// #TODO This file has been pulled into this library and needs
// refactoring - we will probably delete it?
import { posthogAiBetaServerClient } from "@oakai/core/src/analytics/posthogAiBetaServerClient";
import { createOpenAIClient } from "@oakai/core/src/llm/openai";
import { aiLogger } from "@oakai/logger";
import type OpenAI from "openai";
import type { PostHog } from "posthog-node";

const log = aiLogger("aila:llm");

export interface OpenAICompletionWithLoggingOptions {
  chatId?: string;
  prompt?: string;
  promptVersion?: string;
  sessionId?: string;
  userId?: string;
}

export type MetricsPayload = {
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  queryDuration: number;
} & OpenAICompletionWithLoggingOptions;

export async function performCompletionAndFetchMetricsPayload(
  payload: OpenAICompletionWithLoggingOptions,
  options: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
) {
  const { userId, chatId } = payload;

  if (!chatId) {
    throw new Error(
      "Debug: no chatId in performCompletionAndFetchMetricsPayload",
    );
  }

  const openai = createOpenAIClient({
    app: "lesson-assistant",
    chatMeta: {
      userId,
      chatId,
    },
  });

  const start = Date.now();
  const completion = await openai.chat.completions.create({
    user: userId,
    ...options,
  });
  const totalTokens = completion.usage?.total_tokens ?? 0;
  const completionTokens = completion.usage?.completion_tokens ?? 0;
  const promptTokens = completion.usage?.prompt_tokens ?? 0;
  const queryDuration = Date.now() - start;
  const { model } = options;
  const metricsPayload = {
    ...payload,
    queryDuration,
    model,
    totalTokens,
    promptTokens,
    completionTokens,
  };
  return { completion, metricsPayload };
}
export async function OpenAICompletionWithLogging(
  payload: OpenAICompletionWithLoggingOptions,
  options: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
) {
  const { completion, metricsPayload } =
    await performCompletionAndFetchMetricsPayload(payload, options);
  const metrics = await reportMetrics(metricsPayload);
  await reportCompletionAnalyticsEvent(metricsPayload);

  log.info("Open AI Metrics", metrics);
  return { completion, metrics };
}

export function reportCompletionAnalyticsEvent(
  payload: MetricsPayload,
  posthog?: PostHog,
) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_API_KEY) {
    return;
  }
  const posthogClient = posthog ?? posthogAiBetaServerClient;
  posthogClient.identify({
    distinctId: payload.userId ?? payload.prompt ?? "bot",
  });
  posthogClient.capture({
    distinctId: payload.userId ?? payload.prompt ?? "bot",
    event: "open_ai_completion_performed",
    properties: {
      total_tokens: payload.totalTokens,
      prompt_tokens: payload.promptTokens,
      completion_tokens: payload.completionTokens,
      query_duration: payload.queryDuration,
      model: payload.model,
      chat_id: payload.chatId,
      session_id: payload.sessionId,
      prompt: payload.prompt,
      prompt_version: payload.promptVersion,
    },
  });
}

function metricPayload(
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

export async function reportMetrics(payload: MetricsPayload) {
  const url = `https://api.datadoghq.com/api/v1/series?api_key=${process.env.DATADOG_API_KEY}`;

  const tags = [
    `chat_id:${payload.chatId ?? "unknown"}`,
    `session_id:${payload.sessionId ?? "unknown"}`,
    `prompt:${payload.prompt ?? "unknown"}`,
    `prompt_version:${payload.promptVersion ?? "unknown"}`,
    `user_id:${payload.userId ?? "unknown"}`,
    `model:${payload.model}`,
  ];

  const now = Math.floor(Date.now() / 1000);

  const body = {
    series: [
      metricPayload(
        "oai.lesson_assistant.prompt_tokens",
        now,
        payload.promptTokens,
        tags,
      ),
      metricPayload(
        "oai.lesson_assistant.completion_tokens",
        now,
        payload.completionTokens,
        tags,
      ),
      metricPayload(
        "oai.lesson_assistant.total_tokens",
        now,
        payload.totalTokens,
        tags,
      ),
      metricPayload(
        "oai.lesson_assistant.query_duration",
        now,
        payload.queryDuration,
        tags,
        "gauge", // query duration is a gauge rather than a count
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

    log.info("Datadog status", result.status);
  }

  return {
    totalTokens: payload.totalTokens,
    promptTokens: payload.promptTokens,
    completionTokens: payload.completionTokens,
    queryDuration: payload.queryDuration,
  };
}
