// #TODO This file has been pulled into this library and needs
// refactoring - we will probably delete it?
import { posthogAiBetaServerClient } from "@oakai/core/src/analytics/posthogAiBetaServerClient";

import type { PostHog } from "posthog-node";

interface OpenAICompletionWithLoggingOptions {
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

export async function reportCompletionAnalyticsEvent(
  payload: MetricsPayload,
  posthog?: PostHog,
) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_API_KEY) {
    return;
  }
  const posthogClient = posthog ?? posthogAiBetaServerClient;
  await posthogClient.captureImmediate({
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
