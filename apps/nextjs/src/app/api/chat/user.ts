import { auth, clerkClient } from "@clerk/nextjs/server";
import { ErrorDocument } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import { demoUsers, inngest } from "@oakai/core";
import { posthogServerClient } from "@oakai/core/src/analytics/posthogServerClient";
import { rateLimits } from "@oakai/core/src/utils/rateLimiting/rateLimit";
import { RateLimitExceededError } from "@oakai/core/src/utils/rateLimiting/userBasedRateLimiter";

import { streamingJSON } from "./protocol";

async function checkRateLimit(
  userId: string,
  isDemoUser: boolean,
  chatId: string,
): Promise<ErrorDocument | null> {
  const rateLimiter = isDemoUser
    ? rateLimits.generations.demo
    : rateLimits.generations.standard;

  try {
    await rateLimiter.check(userId);
  } catch (e) {
    if (e instanceof RateLimitExceededError) {
      return await handleRateLimitError(e, userId, chatId);
    }
    throw e;
  }

  return null;
}

export async function handleRateLimitError(
  error: RateLimitExceededError,
  userId: string,
  chatId: string,
): Promise<ErrorDocument> {
  // Report to posthog
  posthogServerClient.identify({
    distinctId: userId,
  });
  posthogServerClient.capture({
    distinctId: userId,
    event: "open_ai_completion_rate_limited",
    properties: {
      chat_id: chatId,
      limit: error.limit,
      resets_at: error.reset,
    },
  });
  await posthogServerClient.shutdown();

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

  return {
    type: "error",
    value: error.message,
    message: `**Unfortunately you've exceeded your fair usage limit for today.** Please come back in ${timeRemainingHours} ${hours}.${higherLimitMessage}`,
  };
}

export async function fetchAndCheckUser(
  chatId: string,
): Promise<{ userId: string } | { failureResponse: Response }> {
  const userId = auth().userId;
  if (!userId) {
    return {
      failureResponse: new Response("Unauthorized", {
        status: 401,
      }),
    };
  }

  const clerkUser = await clerkClient.users.getUser(userId);
  if (clerkUser.banned) {
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
    return {
      failureResponse: streamingJSON(rateLimitedMessage),
    };
  }

  return { userId };
}
