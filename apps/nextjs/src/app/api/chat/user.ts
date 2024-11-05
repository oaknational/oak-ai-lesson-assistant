import { auth, clerkClient } from "@clerk/nextjs/server";
import { AilaAuthenticationError } from "@oakai/aila/src/core/AilaError";
import { demoUsers } from "@oakai/core";
import { posthogAiBetaServerClient } from "@oakai/core/src/analytics/posthogAiBetaServerClient";
import { inngest } from "@oakai/core/src/inngest";
import { UserBannedError } from "@oakai/core/src/models/userBannedError";
import { withTelemetry } from "@oakai/core/src/tracing/serverTracing";
import { rateLimits } from "@oakai/core/src/utils/rateLimiting/rateLimit";
import { RateLimitExceededError } from "@oakai/core/src/utils/rateLimiting/userBasedRateLimiter";

async function checkRateLimit(
  userId: string,
  isDemoUser: boolean,
  chatId: string,
): Promise<void> {
  return withTelemetry("check-rate-limit", { userId, chatId }, async (span) => {
    const rateLimiter = isDemoUser
      ? rateLimits.generations.demo
      : rateLimits.generations.standard;

    try {
      await rateLimiter.check(userId);
    } catch (e) {
      span.setTag("error", true);
      if (e instanceof Error) {
        span.setTag("error.message", e.message);
      }

      if (e instanceof RateLimitExceededError) {
        await reportRateLimitError(e, userId, chatId);

        const timeRemainingHours = Math.ceil(
          (e.reset - Date.now()) / 1000 / 60 / 60,
        );
        span.setTag("error.type", "RateLimitExceeded");
        span.setTag("rate_limit.reset_hours", timeRemainingHours);
      }

      throw e;
    }
  });
}

export async function reportRateLimitError(
  error: RateLimitExceededError,
  userId: string,
  chatId: string,
): Promise<void> {
  return withTelemetry(
    "handle-rate-limit-error",
    { chatId, userId },
    async () => {
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
    },
  );
}

export async function fetchAndCheckUser(chatId: string): Promise<string> {
  return withTelemetry("fetch-and-check-user", { chatId }, async (span) => {
    const userId = auth().userId;
    if (!userId) {
      span.setTag("error", true);
      span.setTag("error.message", "Unauthorized");
      throw new AilaAuthenticationError("No user id");
    }

    const clerkUser = await clerkClient.users.getUser(userId);
    if (clerkUser.banned) {
      span.setTag("error", true);
      span.setTag("error.message", "Account locked");
      throw new UserBannedError(userId);
    }

    const isDemoUser = demoUsers.isDemoUser(clerkUser);
    try {
      await checkRateLimit(userId, isDemoUser, chatId);
    } catch (e) {
      if (e instanceof RateLimitExceededError) {
        span.setTag("error", true);
        span.setTag("error.message", "Rate limited");
      }
      throw e;
    }

    span.setTag("user.id", userId);
    span.setTag("user.demo", isDemoUser);
    return userId;
  });
}
