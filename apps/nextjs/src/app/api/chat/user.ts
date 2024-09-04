import { auth, clerkClient } from "@clerk/nextjs/server";
import { ErrorDocument } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import { demoUsers, inngest } from "@oakai/core";
import { posthogAiBetaServerClient } from "@oakai/core/src/analytics/posthogAiBetaServerClient";
import { withTelemetry } from "@oakai/core/src/tracing/serverTracing";
import { rateLimits } from "@oakai/core/src/utils/rateLimiting/rateLimit";
import { RateLimitExceededError } from "@oakai/core/src/utils/rateLimiting/userBasedRateLimiter";

import { streamingJSON } from "./protocol";

export async function handleUserLookup(chatId: string) {
  return await withTelemetry(
    "chat-user-lookup",
    { chat_id: chatId },
    async (userLookupSpan) => {
      const result = await fetchAndCheckUser(chatId);

      if ("failureResponse" in result) {
        userLookupSpan.setTag("error", true);
        userLookupSpan.setTag("error.message", "user lookup failed");
      }
      return result;
    },
  );
}

async function checkRateLimit(
  userId: string,
  isDemoUser: boolean,
  chatId: string,
): Promise<ErrorDocument | null> {
  return withTelemetry("check-rate-limit", { userId, chatId }, async (span) => {
    const rateLimiter = isDemoUser
      ? rateLimits.generations.demo
      : rateLimits.generations.standard;

    try {
      await rateLimiter.check(userId);
      return null;
    } catch (e) {
      if (e instanceof RateLimitExceededError) {
        return await handleRateLimitError(e, userId, chatId);
      }
      span.setTag("error", true);
      if (e instanceof Error) {
        span.setTag("error.message", e.message);
      }
      throw e;
    }
  });
}

export async function handleRateLimitError(
  error: RateLimitExceededError,
  userId: string,
  chatId: string,
): Promise<ErrorDocument> {
  return withTelemetry(
    "handle-rate-limit-error",
    { chatId, userId },
    async (span) => {
      posthogAiBetaServerClient.identify({
        distinctId: userId,
      });
      posthogAiBetaServerClient.capture({
        distinctId: userId,
        event: "open_ai_completion_rate_limited",
        properties: {
          chat_id: chatId,
          limit: error.limit,
          resets_at: error.reset,
        },
      });
      await posthogAiBetaServerClient.shutdown();

      await inngest.send({
        name: "app/slack.notifyRateLimit",
        user: {
          id: userId,
        },
        data: {
          limit: error.limit,
          reset: new Date(error.reset),
        },
      });

      // Build user-friendly error message
      const timeRemainingHours = Math.ceil(
        (error.reset - Date.now()) / 1000 / 60 / 60,
      );
      const hours = timeRemainingHours === 1 ? "hour" : "hours";
      const higherLimitMessage = process.env.RATELIMIT_FORM_URL
        ? ` If you require a higher limit, please [make a request](${process.env.RATELIMIT_FORM_URL}).`
        : "";

      span.setTag("error", true);
      span.setTag("error.type", "RateLimitExceeded");
      span.setTag("error.message", error.message);
      span.setTag("rate_limit.reset_hours", timeRemainingHours);

      return {
        type: "error",
        value: error.message,
        message: `**Unfortunately you've exceeded your fair usage limit for today.** Please come back in ${timeRemainingHours} ${hours}.${higherLimitMessage}`,
      };
    },
  );
}

export async function fetchAndCheckUser(
  chatId: string,
): Promise<{ userId: string } | { failureResponse: Response }> {
  return withTelemetry("fetch-and-check-user", { chatId }, async (span) => {
    const userId = auth().userId;
    if (!userId) {
      span.setTag("error", true);
      span.setTag("error.message", "Unauthorized");
      return {
        failureResponse: new Response("Unauthorized", {
          status: 401,
        }),
      };
    }

    const clerkUser = await clerkClient.users.getUser(userId);
    if (clerkUser.banned) {
      span.setTag("error", true);
      span.setTag("error.message", "Account locked");
      return {
        failureResponse: streamingJSON({
          type: "action",
          action: "SHOW_ACCOUNT_LOCKED",
        }),
      };
    }

    const isDemoUser = demoUsers.isDemoUser(clerkUser);
    const rateLimitedMessage = await checkRateLimit(userId, isDemoUser, chatId);
    if (rateLimitedMessage) {
      span.setTag("error", true);
      span.setTag("error.message", "Rate limited");
      return {
        failureResponse: streamingJSON(rateLimitedMessage),
      };
    }

    span.setTag("user.id", userId);
    span.setTag("user.demo", isDemoUser);
    return { userId };
  });
}
