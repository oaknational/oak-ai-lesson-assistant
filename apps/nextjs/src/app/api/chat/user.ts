import { AilaAuthenticationError } from "@oakai/aila/src/core/AilaError";
import { demoUsers } from "@oakai/core";
import { posthogAiBetaServerClient } from "@oakai/core/src/analytics/posthogAiBetaServerClient";
import { inngest } from "@oakai/core/src/inngest";
import { UserBannedError } from "@oakai/core/src/models/userBannedError";
import { startSpan } from "@oakai/core/src/tracing";
import { rateLimits } from "@oakai/core/src/utils/rateLimiting";
import { RateLimitExceededError } from "@oakai/core/src/utils/rateLimiting/errors";

import { auth, clerkClient } from "@clerk/nextjs/server";

async function checkRateLimit(
  userId: string,
  isDemoUser: boolean,
  chatId: string,
): Promise<void> {
  return startSpan("check-rate-limit", { userId, chatId }, async (span) => {
    const rateLimiter = isDemoUser
      ? rateLimits.generations.demo
      : rateLimits.generations.standard;

    try {
      await rateLimiter.check(userId);
    } catch (e) {
      if (e instanceof RateLimitExceededError) {
        await reportRateLimitError(e, userId, chatId);
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
  return startSpan("handle-rate-limit-error", { chatId, userId }, async () => {
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
  });
}

export async function fetchAndCheckUser(chatId: string): Promise<string> {
  const userId = auth().userId;

  return startSpan("fetch-and-check-user", { chatId }, async (span) => {
    if (!userId) {
      throw new AilaAuthenticationError("No user id");
    }

    const clerkUser = await clerkClient.users.getUser(userId);
    if (clerkUser.banned) {
      throw new UserBannedError(userId);
    }

    const isDemoUser = demoUsers.isDemoUser(clerkUser);
    await checkRateLimit(userId, isDemoUser, chatId);

    return userId;
  });
}
